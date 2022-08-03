use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyState {
    OPEN,
    ASSIGNED,
    PAID,
}

#[account]
pub struct Bounty {
    /// Bounty board the bounty belongs to
    pub bounty_board: Pubkey,

    /// Bounty title
    pub title: String,

    /// Current bounty state
    pub state: BountyState,

    /// The ContributorRecord representing the user who created and owns this Bounty
    /// Only contributors with certain roles are authorized to do this
    pub contributor_record: Pubkey,

    // u64 cuz anchor does not support UnixTimestamp type yet
    /// When the Bounty was created
    pub created_at: i64,
    // pub description: ipfs add,
    // pub tier: u8,
}
