// src/backend/reporting/src/lib.rs

use ic_cdk_macros::{init, update, query};
use ic_cdk::{
    trap,
    api::{caller as msg_caller},
};
use ic_cdk::call;
use candid::{Principal, Nat, candid_method};

// --- Types and Structures ---

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
pub enum UserRole { HR, Worker, Establishment }

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct UserProfile {
    pub principal: Principal,
    pub name: String,
    pub role: UserRole,
    pub company_id: Option<String>,
    pub created_at: i64,
    pub is_active: bool,
}

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
pub enum BenefitType { Food, Culture, Health, Transport, Education }

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
pub enum TransactionType { Credit, Debit }

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Transaction {
    pub id: String,
    pub worker_id: Principal,
    pub benefit_type: BenefitType,
    pub transaction_type: TransactionType,
    pub amount: Nat,
    pub establishment_id: Option<Principal>,
    pub establishment_name: Option<String>,
    pub program_id: Option<String>,
    pub timestamp: i64,
    pub description: String,
}

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
pub enum PaymentStatus { Pending, Completed, Failed, Cancelled }

#[derive(candid::CandidType, Clone, Debug, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentTransaction {
    pub id: String,
    pub status: PaymentStatus,
    pub benefit_type: BenefitType,
    pub establishment_id: Principal,
    pub description: String,
    pub created_at: i64,
    pub worker_id: Principal,
    pub processed_at: Option<i64>,
    pub amount: Nat,
}

// State variables (not persistent for this simple reporting MVP)
static mut AUTHORIZED_CALLER: Option<Principal> = None;

#[init]
#[candid_method(init)]
fn init(_auth_canister_id: Principal, _wallets_canister_id: Principal, _establishment_canister_id: Principal) {
    ic_cdk::println!("Reporting canister initialized.");
    unsafe { AUTHORIZED_CALLER = Some(msg_caller()); }
}

#[update]
#[candid_method(update)]
fn set_authorized_caller(new_authorized_caller: Principal) {
    unsafe {
        if let Some(auth_caller) = AUTHORIZED_CALLER {
            if auth_caller != msg_caller() {
                trap("Unauthorized: Only current authorized caller can set a new one.");
            }
        } else {
            AUTHORIZED_CALLER = Some(msg_caller());
        }
        AUTHORIZED_CALLER = Some(new_authorized_caller);
    }
    ic_cdk::println!("Authorized caller set to {:?}", new_authorized_caller);
}

// Helper to check authorization
fn assert_authorized() -> Result<(), String> {
    unsafe {
        if let Some(auth_caller) = AUTHORIZED_CALLER {
            if auth_caller == msg_caller() {
                Ok(())
            } else {
                Err("Unauthorized access: Caller is not the authorized entity.".to_string())
            }
        } else {
            Err("Unauthorized access: No authorized caller set.".to_string())
        }
    }
}

// --- Reporting Functions ---

#[query]
#[candid_method(query)]
async fn get_all_worker_transactions(worker_id: Principal, limit: Option<Nat>) -> Result<Vec<Transaction>, String> {
    assert_authorized()?;
    let wallets_canister_id = Principal::from_text("ucwa4-rx777-77774-qaada-cai").unwrap();
    let (result,): (Result<Vec<Transaction>, String>,) =
        call(wallets_canister_id, "getTransactionsForReporting", (worker_id, limit)).await
            .map_err(|e| format!("Call failed: {:?}", e))?;
    result
}

#[query]
#[candid_method(query)]
async fn get_all_establishment_transactions(establishment_id: Principal, limit: Option<Nat>) -> Result<Vec<PaymentTransaction>, String> {
    assert_authorized()?;
    let establishment_canister_id = Principal::from_text("uzt4z-lp777-77774-qaabq-cai").unwrap();
    let (result,): (Result<Vec<PaymentTransaction>, String>,) =
        call(establishment_canister_id, "getTransactionsForReporting", (establishment_id, limit)).await
            .map_err(|e| format!("Call failed: {:?}", e))?;
    result
}

// Export candid interface
ic_cdk::export_candid!();