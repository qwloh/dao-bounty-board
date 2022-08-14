use anchor_lang::prelude::*;

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk,"payout_record"
#[account]
pub struct PayoutRecord {
    pub bounty: Pubkey,
    pub bounty_submission: Pubkey,
    pub contributor_record: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub destination_ata: Pubkey,
}
