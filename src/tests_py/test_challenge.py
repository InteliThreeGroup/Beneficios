import unittest
import os
import time
from pocket_ic import PocketIC, WasmResult
from ic.principal import Principal

# --- Bloco de Configuração ---
try:
    dfx_cache_path = os.popen("dfx cache show").read().strip()
    pocket_ic_path = os.path.join(dfx_cache_path, "pocket-ic")
    if not os.path.exists(pocket_ic_path): raise FileNotFoundError
    os.environ["POCKET_IC_BIN"] = pocket_ic_path
except Exception:
    print("ERRO: Binário do PocketIC não encontrado. Tente 'dfx cache install'.")
    exit(1)

# --- Caminhos e IDs ---
PROJ_ROOT = os.path.join(os.path.dirname(__file__), "../..") 
WASM_TARGET_DIR = os.path.join(PROJ_ROOT, ".dfx/local/canisters") 
CHALLENGES_WASM = os.path.join(WASM_TARGET_DIR, "challenges/challenges.wasm")
CHALLENGES_DID = os.path.join(WASM_TARGET_DIR, "challenges/challenges.did")
IDENTITY_MOCK_WASM = os.path.join(WASM_TARGET_DIR, "identity_auth_mock_for_challenges/identity_auth_mock_for_challenges.wasm")
WALLET_MOCK_WASM = os.path.join(WASM_TARGET_DIR, "wallet_mock_for_challenges/wallet_mock_for_challenges.wasm")

# IDs que o canister `Challenges` espera (pegos do código .mo)
IDENTITY_PRINCIPAL = Principal.from_str("ucwa4-rx777-77774-qaada-cai")
WALLET_PRINCIPAL = Principal.from_str("vpyes-67777-77774-qaaeq-cai")


class ChallengesTests(unittest.TestCase):
    def setUp(self):
        self.pic = PocketIC()
        
        # Identidades de teste
        self.hr_a = Principal.from_str("aaaaa-aa")
        self.worker_a = Principal.from_str("bbbbb-bb")
        self.worker_b = Principal.from_str("ccccc-cc")
        
        # Instala Mocks com os IDs corretos
        self.pic.create_canister(canister_id=IDENTITY_PRINCIPAL)
        with open(IDENTITY_MOCK_WASM, "rb") as f:
            self.pic.install_code(IDENTITY_PRINCIPAL, f.read(), b'')
        self.identity_mock_actor = self.pic.actor_from_candid(IDENTITY_PRINCIPAL, "service: { addUserProfile: (record { principal: principal; name: text; role: variant { HR; Worker; Establishment }; companyId: text }) -> (); }")

        self.pic.create_canister(canister_id=WALLET_PRINCIPAL)
        with open(WALLET_MOCK_WASM, "rb") as f:
            self.pic.install_code(WALLET_PRINCIPAL, f.read(), b'')

        # Instala o canister Challenges
        self.challenges_canister_id = self.pic.create_canister()
        with open(CHALLENGES_WASM, "rb") as f:
            self.pic.install_code(self.challenges_canister_id, f.read(), b'')
        with open(CHALLENGES_DID, "r") as f:
            self.challenges_actor = self.pic.actor_from_candid(self.challenges_canister_id, f.read())
            
        # Configura perfis de usuário no mock de identidade
        self.identity_mock_actor.addUserProfile({'principal': self.hr_a, 'name': "Alice HR", 'role': {'HR': None}, 'companyId': "Company-A"})
        self.identity_mock_actor.addUserProfile({'principal': self.worker_a, 'name': "Bob Worker", 'role': {'Worker': None}, 'companyId': "Company-A"})
        self.identity_mock_actor.addUserProfile({'principal': self.worker_b, 'name': "Charlie Worker", 'role': {'Worker': None}, 'companyId': "Company-B"})

    def test_full_challenge_lifecycle(self):
        """Testa o fluxo completo: HR cria, Worker submete, HR aprova."""
        # 1. HR da Company-A cria um desafio
        self.pic.set_caller(self.hr_a)
        # Prazo de 1 hora a partir de agora (em nanossegundos)
        deadline = (int(time.time()) + 3600) * 1_000_000_000
        
        create_result = self.challenges_actor.createChallenge(
            "Desafio de Bem-Estar", "Medite por 15 minutos", "Company-A", 100, deadline
        )
        self.assertIn('Ok', create_result)
        challenge = create_result['Ok']
        challenge_id = challenge['id']
        
        # 2. Worker da Company-A submete ao desafio
        self.pic.set_caller(self.worker_a)
        submit_result = self.challenges_actor.submitToChallenge(challenge_id, "Feito! Usei o app Calm.")
        self.assertIn('Ok', submit_result)
        submission_id = submit_result['Ok']['id']

        # 3. HR da Company-A aprova a submissão
        self.pic.set_caller(self.hr_a)
        approve_result = self.challenges_actor.approveOrRejectSubmission(submission_id, True)
        self.assertIn('Ok', approve_result)
        
        # 4. Verifica o status final da submissão
        self.pic.set_caller(Principal.anonymous()) # Consulta pode ser anônima
        submissions = self.challenges_actor.getSubmissionsForChallenge(challenge_id)
        self.assertEqual(len(submissions), 1)
        self.assertIn('Approved', submissions[0]['status'])
        print("\n✅ Teste de ciclo de vida completo do desafio passou com sucesso!")

    def test_worker_from_another_company_cannot_submit(self):
        """Testa se um trabalhador de outra empresa é bloqueado."""
        # 1. HR da Company-A cria um desafio
        self.pic.set_caller(self.hr_a)
        deadline = (int(time.time()) + 3600) * 1_000_000_000
        challenge_id = self.challenges_actor.createChallenge(
            "Desafio Interno", "Organize sua mesa", "Company-A", 50, deadline
        )['Ok']['id']

        # 2. Worker da Company-B tenta submeter
        self.pic.set_caller(self.worker_b)
        submit_result = self.challenges_actor.submitToChallenge(challenge_id, "Tentei, mas sou de outra empresa.")
        self.assertIn('Err', submit_result)
        self.assertIn('sua própria empresa', submit_result['Err'])
        print("\n✅ Teste de segurança (worker de outra empresa) passou com sucesso!")

    def test_cannot_submit_to_expired_challenge(self):
        """Testa se a submissão a um desafio expirado falha."""
        # 1. HR cria um desafio com prazo curto
        self.pic.set_caller(self.hr_a)
        deadline = (int(self.pic.get_time() / 1_000_000_000) + 10) * 1_000_000_000 # 10s no futuro
        challenge_id = self.challenges_actor.createChallenge(
            "Desafio Rápido", "Responda em 10s", "Company-A", 10, deadline
        )['Ok']['id']

        # 2. Avança o tempo no PocketIC para depois do prazo
        self.pic.advance_time(15 * 1_000_000_000) # Avança 15 segundos

        # 3. Worker tenta submeter
        self.pic.set_caller(self.worker_a)
        submit_result = self.challenges_actor.submitToChallenge(challenge_id, "Tarde demais!")
        self.assertIn('Err', submit_result)
        self.assertIn('expirou', submit_result['Err'])
        print("\n✅ Teste de desafio expirado passou com sucesso!")

if __name__ == "__main__":
    unittest.main()