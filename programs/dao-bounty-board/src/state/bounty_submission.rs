use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountySubmissionState {
    Accepted,
    ChangeRequested,
    Rejected,
    ForceAccepted,
    AutoRejected,
    PendingReview,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk, "bounty_submission", contributor_record_pk
#[account]
pub struct BountySubmission {
    pub bounty: Pubkey,
    pub link_to_submission: String, // ipfs

    pub contributor_record: Pubkey,
    pub state: BountySubmissionState,
    pub request_change_count: u8,

    pub first_submitted_at: i64,
    pub change_requested_at: Option<i64>,
    pub updated_at: Option<i64>,
    pub rejected_at: Option<i64>,
}
