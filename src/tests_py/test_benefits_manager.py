import unittest
import os
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
MANAGER_WASM = os.path.join(WASM_TARGET_DIR, "benefits_manager/benefits_manager.wasm")
MANAGER_DID = os.path.join(WASM_TARGET_DIR, "benefits_manager/benefits_manager.did")
IDENTITY_MOCK_WASM = os.path.join(WASM_TARGET_DIR, "identity_auth_mock/identity_auth_mock.wasm")
WALLET_MOCK_WASM = os.path.join(WASM_TARGET_DIR, "wallet_mock_for_manager/wallet_mock_for_manager.wasm")

# IDs que o BenefitsManager espera (pegos do código .mo)
IDENTITY_PRINCIPAL = Principal.from_str("umunu-kh777-77774-qaaca-cai")
WALLET_PRINCIPAL = Principal.from_str("vpyes-67777-77774-qaaeq-cai")


class BenefitsManagerTests(unittest.TestCase):
    def setUp(self):
        self.pic = PocketIC()
        
        # Identidades para o teste
        self.hr_manager = Principal.from_str("aaaaa-aa")
        self.worker_1 = Principal.from_str("bbbbb-bb")
        self.worker_2 = Principal.from_str("ccccc-cc")
        
        # Instala o MOCK do IdentityAuth com o ID esperado
        self.pic.create_canister(canister_id=IDENTITY_PRINCIPAL)
        with open(IDENTITY_MOCK_WASM, "rb") as f:
            self.pic.install_code(IDENTITY_PRINCIPAL, f.read(), b'')
        self.identity_mock_actor = self.pic.actor_from_candid(IDENTITY_PRINCIPAL, "service: { setShouldSucceed: (bool) -> (); }")

        # Instala o MOCK do Wallet com o ID esperado
        self.pic.create_canister(canister_id=WALLET_PRINCIPAL)
        with open(WALLET_MOCK_WASM, "rb") as f:
            self.pic.install_code(WALLET_PRINCIPAL, f.read(), b'')

        # Instala o canister BenefitsManager que vamos testar
        self.manager_canister_id = self.pic.create_canister()
        with open(MANAGER_WASM, "rb") as f:
            self.pic.install_code(self.manager_canister_id, f.read(), b'')
        with open(MANAGER_DID, "r") as f:
            self.manager_actor = self.pic.actor_from_candid(self.manager_canister_id, f.read())

    def test_create_program_unauthorized(self):
        """Testa se a criação de programa falha se o mock de identidade retornar 'false'."""
        # Configura o mock para falhar na autorização
        self.identity_mock_actor.setShouldSucceed(False)
        self.pic.set_caller(self.hr_manager)
        
        # A chamada deve ser rejeitada (trap)
        result = self.pic.update_call(
            self.manager_canister_id,
            "createBenefitProgram",
            ("Vale Refeição", {'Food': None}, "CompanyA", 500, {'Monthly': None}, 5),
            sender=self.hr_manager
        )
        self.assertEqual(result, WasmResult.Reject)
        print("\n✅ Teste de segurança (HR não autorizado) passou com sucesso!")

    def test_full_payment_cycle(self):
        """Testa o ciclo completo: depositar, criar, associar e pagar."""
        # --- Parte 1: Configuração (com autorização OK) ---
        self.identity_mock_actor.setShouldSucceed(True)
        self.pic.set_caller(self.hr_manager)

        # Deposita fundos no canister
        deposit_result = self.manager_actor.depositFunds(1000)
        self.assertEqual(deposit_result['Ok'], 1000)

        # Cria um programa de benefícios
        program_result = self.manager_actor.createBenefitProgram("Vale Cultura", {'Culture': None}, "CompanyA", 300, {'Monthly': None}, 10)
        self.assertIn('Ok', program_result)
        program = program_result['Ok']
        program_id = program['id']

        # Associa dois trabalhadores ao programa
        self.manager_actor.assignWorkerToBenefit(self.worker_1, program_id, [])
        self.manager_actor.assignWorkerToBenefit(self.worker_2, program_id, [])

        # --- Parte 2: Execução do Pagamento ---
        # Saldo antes: 1000. Pagamento: 2 trabalhadores * 300 = 600. Saldo depois: 400.
        payment_result = self.manager_actor.executeManualPayment(program_id)
        self.assertIn('Ok', payment_result)
        
        # --- Parte 3: Verificação ---
        final_funds = self.manager_actor.getAvailableFunds()
        self.assertEqual(final_funds, 400)
        print("\n✅ Teste de ciclo de pagamento completo passou com sucesso!")

    def test_payment_insufficient_funds(self):
        """Testa se o pagamento falha quando não há fundos suficientes."""
        self.identity_mock_actor.setShouldSucceed(True)
        self.pic.set_caller(self.hr_manager)

        # Deposita fundos insuficientes (só 500, mas o pagamento precisa de 600)
        self.manager_actor.depositFunds(500)

        program_result = self.manager_actor.createBenefitProgram("Plano de Saúde", {'Health': None}, "CompanyB", 300, {'Monthly': None}, 15)
        program_id = program_result['Ok']['id']

        self.manager_actor.assignWorkerToBenefit(self.worker_1, program_id, [])
        self.manager_actor.assignWorkerToBenefit(self.worker_2, program_id, [])

        # A chamada de pagamento deve ser rejeitada
        result = self.pic.update_call(
            self.manager_canister_id,
            "executeManualPayment",
            (program_id,),
            sender=self.hr_manager
        )
        self.assertEqual(result, WasmResult.Reject)
        print("\n✅ Teste de fundos insuficientes passou com sucesso!")


if __name__ == "__main__":
    unittest.main()