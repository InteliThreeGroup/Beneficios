import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";

// Este módulo define a interface para o canister de gerenciamento da IC (aaaaa-aa)
// Ele inclui os tipos e funções necessários para interagir com a API do Bitcoin.
module Management {

  // Representa as redes Bitcoin disponíveis.
  public type BitcoinNetwork = {
    #mainnet;
    #testnet;
  };

  // Identificador para uma chave tECDSA.
  // A curva é sempre secp256k1 para Bitcoin.
  // 'name' é um identificador que você define (e.g., "test_key_1", "key_prod_1").
  public type EcdsaKeyId = {
    curve: { #secp256k1 };
    name: Text;
  };

  // Representa uma "saída de transação não gasta" (Unspent Transaction Output).
  public type UTXO = {
    outpoint: {
      txid: Blob; // ID da transação (geralmente 32 bytes)
      vout: Nat32; // Índice da saída dentro da transação
    };
    value: Nat64; // Valor em satoshis
    height: Nat32; // Altura do bloco em que foi confirmado
  };

  // --- Tipos para Requisições e Respostas ---

  // Requisição para obter o saldo de um endereço.
  public type GetBalanceRequest = {
    address: Text;
    network: BitcoinNetwork;
    min_confirmations: ?Nat32; // Opcional: número de confirmações mínimas
  };

  // Requisição para obter as UTXOs de um endereço.
  public type GetUtxosRequest = {
    address: Text;
    network: BitcoinNetwork;
    filter: ?{
      #min_confirmations: Nat32; // Filtrar por confirmações
    };
  };

  // Resposta da chamada para obter UTXOs.
  public type GetUtxosResponse = {
    utxos: [UTXO];
    tip_height: Nat32; // Altura do bloco mais recente na blockchain
    tip_hash: Blob;
    next_page: ?Blob; // Para paginação, se houver muitos UTXOs
  };

  // Requisição para enviar (transmitir) uma transação para a rede.
  public type SendTransactionRequest = {
    transaction: Blob; // A transação serializada em bytes
    network: BitcoinNetwork;
  };

  // Requisição para obter uma chave pública ECDSA.
  public type EcdsaPublicKeyRequest = {
    canister_id: ?Principal; // Nulo para o próprio canister
    derivation_path: [Blob]; // Caminho para derivação da chave
    key_id: EcdsaKeyId;
  };

  // Resposta contendo a chave pública.
  public type EcdsaPublicKeyResponse = {
    public_key: Blob;
    chain_code: Blob;
  };

  // Requisição para assinar um hash de mensagem.
  public type SignWithEcdsaRequest = {
    message_hash: Blob; // O hash de 32 bytes que deve ser assinado
    derivation_path: [Blob];
    key_id: EcdsaKeyId;
  };

  // Resposta contendo a assinatura.
  public type SignWithEcdsaResponse = {
    signature: Blob;
  };

  // --- Interface do Ator ---

  // Define o ator que representa o canister de gerenciamento.
  // O principal "aaaaa-aa" é um endereço fixo na IC.
  public actor class IC(principal "aaaaa-aa") {
    // Funções da API Bitcoin
    public func bitcoin_get_balance(req: GetBalanceRequest) : async Nat64;
    public func bitcoin_get_utxos(req: GetUtxosRequest) : async GetUtxosResponse;
    public func bitcoin_send_transaction(req: SendTransactionRequest) : async ();

    // Funções da API tECDSA
    public func ecdsa_public_key(req: EcdsaPublicKeyRequest) : async EcdsaPublicKeyResponse;
    public func sign_with_ecdsa(req: SignWithEcdsaRequest) : async SignWithEcdsaResponse;
  };
};