// Caminho do arquivo: src/lib/bitcoin/Management.mo

import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";

module Management {
  public type BitcoinNetwork = { #mainnet; #testnet; #regtest};
  public type EcdsaKeyId = { curve: { #secp256k1 }; name: Text; };
  public type UTXO = { outpoint: { txid: Blob; vout: Nat32; }; value: Nat64; height: Nat32; };
  public type GetBalanceRequest = { address: Text; network: BitcoinNetwork; min_confirmations: ?Nat32; };
  public type GetUtxosRequest = { address: Text; network: BitcoinNetwork; filter: ?{ min_confirmations: Nat32; }; };
  public type GetUtxosResponse = { utxos: [UTXO]; tip_height: Nat32; tip_hash: Blob; next_page: ?Blob; };
  public type SendTransactionRequest = { transaction: Blob; network: BitcoinNetwork; };
  public type EcdsaPublicKeyRequest = { canister_id: ?Principal; derivation_path: [Blob]; key_id: EcdsaKeyId; };
  public type EcdsaPublicKeyResponse = { public_key: Blob; chain_code: Blob; };
  public type SignWithEcdsaRequest = { message_hash: Blob; derivation_path: [Blob]; key_id: EcdsaKeyId; };
  public type SignWithEcdsaResponse = { signature: Blob; };

  // --- Interface do Ator (SINTAXE CORRETA) ---
  public type IC = actor {
    bitcoin_get_balance: (req: GetBalanceRequest) -> async Nat64;
    bitcoin_get_utxos: (req: GetUtxosRequest) -> async GetUtxosResponse;
    bitcoin_send_transaction: (req: SendTransactionRequest) -> async ();
    ecdsa_public_key: (req: EcdsaPublicKeyRequest) -> async EcdsaPublicKeyResponse;
    sign_with_ecdsa: (req: SignWithEcdsaRequest) -> async SignWithEcdsaResponse;
  };
  
  public let ic : IC = actor("aaaaa-aa");
};