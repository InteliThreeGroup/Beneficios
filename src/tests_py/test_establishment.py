import unittest
import os
from pocket_ic import PocketIC, WasmResult
from ic.principal import Principal

# --- Bloco de Configuração (igual ao anterior) ---
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
ESTABLISHMENT_WASM_PATH = os.path.join(WASM_TARGET_DIR, "establishment/establishment.wasm")
ESTABLISHMENT_DID_PATH = os.path.join(WASM_TARGET_DIR, "establishment/establishment.did")
WALLETS_MOCK_WASM_PATH = os.path.join(WASM_TARGET_DIR, "wallets_mock/wallets_mock.wasm")

# ID que o canister `establishment` espera que o `wallets` tenha
# Pegamos do código `establishment.mo`: "vpyes-67777-77774-qaaeq-cai"
MOCK_WALLET_PRINCIPAL = Principal.from_str("vpyes-67777-77774-qaaeq-cai")


class EstablishmentTests(unittest.TestCase):
    def setUp(self):
        self.pic = PocketIC()
        
        # Identidades para o teste
        self.establishment_owner = Principal.from_str("aaaaa-aa") # Dono do estabelecimento
        self.worker_principal = Principal.from_str("bbbbb-bb")    # Trabalhador

        # Instala o MOCK do Wallets com o ID exato que o `establishment` espera
        self.pic.create_canister(canister_id=MOCK_WALLET_PRINCIPAL)
        with open(WALLETS_MOCK_WASM_PATH, "rb") as f:
            self.pic.install_code(MOCK_WALLET_PRINCIPAL, f.read(), b'')
        
        # Instala o canister Establishment que vamos testar
        self.establishment_canister_id = self.pic.create_canister()
        with open(ESTABLISHMENT_WASM_PATH, "rb") as f:
            self.pic.install_code(self.establishment_canister_id, f.read(), b'')

        with open(ESTABLISHMENT_DID_PATH, "r") as f:
            self.establishment_actor = self.pic.actor_from_candid(self.establishment_canister_id, f.read())

    def test_register_and_get_establishment(self):
        """Testa se um estabelecimento pode se registrar e ser consultado."""
        self.pic.set_caller(self.establishment_owner) # Define quem está fazendo a chamada

        registration_request = {
            'name': "Padaria Pão Quente",
            'country': "Brasil",
            'businessCode': "12345",
            'walletPrincipal': self.establishment_owner,
            'acceptedBenefitTypes': [{'Food': None}, {'Health': None}]
        }
        
        # Registra
        result = self.establishment_actor.registerEstablishment(registration_request)
        self.assertIn('Ok', result)
        profile = result['Ok']
        self.assertEqual(profile['name'], "Padaria Pão Quente")

        # Consulta
        get_result = self.establishment_actor.getEstablishment()
        self.assertIn('Ok', get_result)
        self.assertEqual(get_result['Ok']['id'], self.establishment_owner)

    def test_validate_payment(self):
        """Testa a lógica de validação de pagamento."""
        self.pic.set_caller(self.establishment_owner)
        registration_request = {
            'name': "Supermercado Legal", 'country': "Brasil", 'businessCode': "67890",
            'walletPrincipal': self.establishment_owner,
            'acceptedBenefitTypes': [{'Food': None}]
        }
        self.establishment_actor.registerEstablishment(registration_request)

        # Validação OK
        self.pic.set_caller(Principal.anonymous()) # Qualquer um pode validar
        validation_ok = self.establishment_actor.validatePayment(self.establishment_canister_id, {'Food': None}, 100)
        self.assertTrue(validation_ok['isValid'])

        # Validação com tipo de benefício não aceito
        validation_fail = self.establishment_actor.validatePayment(self.establishment_canister_id, {'Culture': None}, 100)
        self.assertFalse(validation_fail['isValid'])
        self.assertIn('does not accept this benefit type', validation_fail['reason'][0])

    def test_process_payment_successful(self):
        """Testa o fluxo de pagamento bem-sucedido com chamada ao mock."""
        self.pic.set_caller(self.establishment_owner)
        registration_request = {
            'name': "Restaurante Saboroso", 'country': "Brasil", 'businessCode': "54321",
            'walletPrincipal': self.establishment_owner, 'acceptedBenefitTypes': [{'Food': None}]
        }
        self.establishment_actor.registerEstablishment(registration_request)

        payment_request = {
            'workerId': self.worker_principal,
            'benefitType': {'Food': None},
            'amount': 150,
            'description': "Almoço executivo"
        }

        # O dono do estabelecimento processa o pagamento
        result = self.establishment_actor.processPayment(payment_request)
        self.assertIn('Ok', result)
        
        # Verifica se a transação foi registrada como completa
        history = self.establishment_actor.getTransactionHistory(None)
        self.assertEqual(len(history), 1)
        self.assertIn('Completed', history[0]['status'])

    def test_register_received_payment_unauthorized(self):
        """Testa se a função protegida rejeita chamadas não autorizadas."""
        # Um chamador qualquer (não o canister de wallet) tenta chamar a função
        self.pic.set_caller(Principal.anonymous())
        
        payment_request = {
            'transactionId': 'fake_tx_id', 'workerId': self.worker_principal,
            'establishmentId': self.establishment_canister_id,
            'benefitType': {'Food': None}, 'amount': 100, 'description': 'test'
        }
        
        # A chamada deve falhar (trap)
        result = self.pic.update_call(
            self.establishment_canister_id,
            "registerReceivedPayment",
            (payment_request,),
            sender=Principal.anonymous()
        )
        self.assertEqual(result, WasmResult.Reject)
        print("\n✅ Teste de segurança (chamada não autorizada) passou com sucesso!")


if __name__ == "__main__":
    unittest.main()