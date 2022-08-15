use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyApplicationStatus {
    Assigned,
    NotAssigned,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk, "bounty_application", contributor_record_pk
#[account]
pub struct BountyApplication {
    pub bounty: Pubkey,
    pub applicant: Pubkey, // user's wallet
    pub contributor_record: Pubkey,
    pub validity: u64,   // duration in seconds
    pub applied_at: i64, // unix timestamp in epoch seconds
    pub status: BountyApplicationStatus,
    pub dummy: String,
}
