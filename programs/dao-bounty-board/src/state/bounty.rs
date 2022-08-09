use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

/// Returns Bounty PDA seeds
pub fn get_bounty_address_seeds<'a>(
    bounty_board: &'a Pubkey,
    bounty_index_le_bytes: &'a [u8],
) -> [&'a [u8]; 3] {
    [
        PROGRAM_AUTHORITY_SEED,
        bounty_board.as_ref(),
        bounty_index_le_bytes,
    ]
}

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
