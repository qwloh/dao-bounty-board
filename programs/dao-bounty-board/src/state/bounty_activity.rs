use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyActivityPayload {
    Apply {
        applicant_wallet: Pubkey,
    },
    Assign {
        actor_wallet: Pubkey,
        submission_index: u8,
        assignee_wallet: Pubkey,
    },
    UnassignOverdue {
        actor_wallet: Pubkey,
        submission_index: u8,
        assignee_wallet: Pubkey,
        rep_deducted: u32,
    },
    Submit {
        assignee_wallet: Pubkey,
        submission_index: u8,
    },
    RequestChange {
        actor_wallet: Pubkey,
        submission_index: u8,
        comment: String, // might be ipfs in the future
    },
    UpdateSubmission {
        assignee_wallet: Pubkey,
        submission_index: u8,
    },
    /// `actor_wallet` whoever accepts the submission. `submission_index` required. `comment` optional.
    Accept,
    ForceAccept,
    Reject {
        actor_wallet: Pubkey,
        submission_index: u8,
        comment: String, // might be ipfs in the future
    },
    RejectForUnaddressedChangeRequest {
        actor_wallet: Pubkey,
        submission_index: u8,
        // do we need comment for this?
    },
    /// `actor_wallet` whoever adds the comment. `submission_index` optional. `comment` required.
    Comment,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_pk, "bounty_activity", activity_index
#[account]
pub struct BountyActivity {
    pub bounty: Pubkey,                 // 32
    pub activity_index: u16,            // 2
    pub timestamp: i64,                 // 8
    pub payload: BountyActivityPayload, // 32 + 1 + 32 / unknown
}
