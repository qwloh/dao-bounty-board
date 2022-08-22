use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountySubmissionState {
    PendingReview,
    ChangeRequested,
    Rejected,
    RejectedForStale,
    Accepted,
    ForceAccepted,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk, "bounty_submission", contributor_record_pk
#[account]
pub struct BountySubmission {
    pub bounty: Pubkey,               // 32
    pub assignee: Pubkey,             // 32, contributor record
    pub assigned_at: i64,             // 8
    pub state: BountySubmissionState, // 1

    pub link_to_submission: String, // unknown, ipfs
    pub first_submitted_at: i64,    // 8

    pub request_change_count: u8,         // 1
    pub change_requested_at: Option<i64>, // 8

    pub updated_at: Option<i64>,  // 8
    pub rejected_at: Option<i64>, // 8
    pub accepted_at: Option<i64>, // 8
}
