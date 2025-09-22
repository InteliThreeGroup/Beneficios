import unittest
import os
from pocket_ic import PocketIC
from ic.principal import Principal

# --- Configuração Inicial (Método Dinâmico e Correto) ---
# Pede ao DFX para nos dizer onde está seu cache, que é o local correto do binário do PocketIC.
try:
    dfx_cache_path = os.popen("dfx cache show").read().strip()
    pocket_ic_path = os.path.join(dfx_cache_path, "pocket-ic")
    
    if not os.path.exists(pocket_ic_path):
        raise FileNotFoundError

    os.environ["POCKET_IC_BIN"] = pocket_ic_path
except Exception:
    print("ERRO: Não foi possível encontrar o binário do PocketIC com 'dfx cache show'.")
    print("Por favor, tente executar 'dfx cache install' na raiz do projeto e tente novamente.")
    exit(1)


# --- Caminhos para os arquivos gerados pelo 'dfx build' ---
PROJ_ROOT = os.path.join(os.path.dirname(__file__), "../..") 
WASM_TARGET_DIR = os.path.join(PROJ_ROOT, ".dfx/local/canisters") 

WALLETS_WASM_PATH = os.path.join(WASM_TARGET_DIR, "wallets/wallets.wasm")
WALLETS_DID_PATH = os.path.join(WASM_TARGET_DIR, "wallets/wallets.did")
ESTABLISHMENT_WASM_PATH = os.path.join(WASM_TARGET_DIR, "establishment/establishment.wasm")

# --- IDs dos Canisters ---
# NOTA: Estes IDs são ignorados pelo PocketIC, mas os mantemos para clareza.
# PocketIC atribui seus próprios IDs de canister no ambiente de teste.
WALLETS_PRINCIPAL_TEXT = "ufxgi-4p777-77774-qaadq-cai"
ESTABLISHMENT_PRINCIPAL_TEXT = "ucwa4-rx777-77774-qaada-cai"


class WalletIntegrationTests(unittest.TestCase):
    pic: PocketIC
    wallet_actor: any 
    worker_id: Principal

    def setUp(self):
        for path in [WALLETS_WASM_PATH, ESTABLISHMENT_WASM_PATH, WALLETS_DID_PATH]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Arquivo não encontrado: {path}. Execute 'dfx build' primeiro.")
        
        self.pic = PocketIC() 
        self.pic.new_instance()
        
        # O PocketIC gerencia os IDs. Vamos criar os canisters e depois obter os IDs deles.
        self.establishment_principal = self.pic.create_canister()
        with open(ESTABLISHMENT_WASM_PATH, "rb") as f:
            establishment_wasm = f.read()
        self.pic.install_code(self.establishment_principal, establishment_wasm, b'')
        
        self.wallets_principal = self.pic.create_canister()
        with open(WALLETS_WASM_PATH, "rb") as f:
            wallets_wasm = f.read()
        self.pic.install_code(self.wallets_principal, wallets_wasm, b'')

        with open(WALLETS_DID_PATH, "r") as f:
            wallets_did = f.read()
        self.wallet_actor = self.pic.actor_from_candid(self.wallets_principal, wallets_did)
        
        # Agora, precisamos dizer ao canister 'wallets' qual é o ID do 'establishment' no nosso teste.
        # Assumindo que seu canister 'wallets' tem uma função para isso, como 'setEstablishmentPrincipal'.
        # Se o nome for diferente, ajuste aqui. Se não tiver, o teste de débito falhará.
        try:
            self.wallet_actor.setEstablishmentPrincipal(self.establishment_principal)
        except Exception as e:
            print(f"\nAVISO: Não foi possível chamar 'setEstablishmentPrincipal'. O teste de débito pode falhar se depender disso. Erro: {e}")
        
        self.worker_id = Principal.from_str("aaaaa-aa")

    def tearDown(self):
        self.pic.delete_instance()

    def test_create_and_get_wallet(self):
        result_create = self.wallet_actor.createWallet(self.worker_id)
        self.assertIn('Ok', result_create)
        result_get = self.wallet_actor.getWallet(self.worker_id)
        self.assertIn('Ok', result_get)
        wallet = result_get['Ok']
        self.assertEqual(wallet['workerId'], self.worker_id)
        self.assertEqual(wallet['totalBalance'], 0)

    def test_full_debit_flow_with_real_establishment(self):
        benefit_type_food = {'Food': None}
        self.wallet_actor.creditBalance(self.worker_id, benefit_type_food, 1000, "prog1", "credit")
        payment_request = {
            'workerId': self.worker_id,
            'establishmentId': self.establishment_principal, # Usando o ID dinâmico do teste
            'establishmentName': "Real Cafe",
            'benefitType': benefit_type_food,
            'amount': 300,
            'description': "Lunch",
        }
        result_debit = self.wallet_actor.debitBalance(payment_request)
        self.assertIn('Ok', result_debit)
        wallet = self.wallet_actor.getWallet(self.worker_id)['Ok']
        self.assertEqual(wallet['totalBalance'], 700)
        self.assertEqual(wallet['balances'][0]['balance'], 700)
        print("\n✅ Teste de integração com débito real passou com sucesso!")

if __name__ == "__main__":
    unittest.main()