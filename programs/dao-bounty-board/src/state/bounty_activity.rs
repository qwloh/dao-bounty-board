use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyActivityType {
    /// `actor_wallet` applicant wallet.
    Apply,
    /// `actor_wallet` whoever assigns the bounty. `target_wallet` assignee wallet.
    Assign,
    /// `actor_wallet` whoever un-assigns the bounty. `target_wallet` assignee wallet. `comment` optional.
    UnassignOverdue,
    /// `actor_wallet` assignee wallet.
    Submit,
    /// `actor_wallet` whoever requests the change. `submission_index` required. `comment` required.
    RequestChange,
    /// `actor_wallet` assignee wallet. `submission_index` required.
    Update,
    /// `actor_wallet` whoever accepts the submission. `submission_index` required. `comment` optional.
    Accept,
    ForceAccept,
    /// `actor_wallet` whoever rejects the submission. `submission_index` required. `comment` optional.
    Reject,
    /// `actor_wallet` whoever rejects the submission. `submission_index` required. `comment` optional.
    RejectForUnaddressedChangeRequest,
    /// `actor_wallet` whoever adds the comment. `submission_index` optional. `comment` required.
    Comment,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk, "bounty_activity", activity_index
#[account]
pub struct BountyActivity {
    pub bounty: Pubkey,                    // 32
    pub activity_type: BountyActivityType, // 1
    pub activity_index: u16,               // 2
    pub timestamp: i64,                    // 8
    pub actor_wallet: Pubkey,              // 32
    pub target_wallet: Option<Pubkey>,     // 32
    pub submission_index: Option<u8>,      // 1
    pub comment: String,
}
