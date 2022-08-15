use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyActivityType {
    Comment,
    Apply,
    Assign,
    Submit,
    Update,
    RequestChange,
    Accept,
    ForceAccept,
    Reject,
    AutoReject,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk, "bounty_activity", activity_index
#[account]
pub struct BountyActivity {
    pub bounty: Pubkey,
    pub activity_type: BountyActivityType,
    pub contributor_record: Pubkey,
    pub note: String,
}
