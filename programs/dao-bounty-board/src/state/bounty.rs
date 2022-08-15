use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

fn get_bounty_address_seeds<'a>(
    bounty_board: &'a Pubkey,
    bounty_index_le_bytes: &'a [u8],
) -> [&'a [u8]; 4] {
    [
        PROGRAM_AUTHORITY_SEED,
        bounty_board.as_ref(),
        b"bounty",
        bounty_index_le_bytes,
    ]
}

pub fn get_bounty_signer_seeds_ingredients<'a>(
    bounty_board: &'a Pubkey,
    bounty_index_le_bytes: &'a [u8],
) -> ([&'a [u8]; 4], u8) {
    let bounty_address_seeds = get_bounty_address_seeds(bounty_board, bounty_index_le_bytes);
    let (address_from_seeds, bump_seed) =
        Pubkey::find_program_address(&bounty_address_seeds[..], &crate::ID);

    msg!(
        "Generated program address: {:?}. Bump: {:?}",
        address_from_seeds,
        bump_seed
    );

    (bounty_address_seeds, bump_seed)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyState {
    Open,
    Assigned,
    SubmissionUnderReview,
    CompleteAndPaid,
}

// hard coded skills type for ALL DAOs
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Skill {
    Development,
    Design,
    Marketing,
    Operations,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_board_pk, "bounty", bounty_index
#[account]
pub struct Bounty {
    // seeds related info
    // move to top for easy filter
    pub bounty_board: Pubkey,
    pub bounty_index: u64, // same type as bounty_board.bounty_count

    pub state: BountyState,
    pub creator: Pubkey, // contributor record
    pub created_at: i64, // UnixTimestamp ni seconds

    pub reward_payout: u64,
    pub reward_mint: Pubkey,
    pub skill: Skill, // correlate to enum
    pub reward_skill_pt: u64,
    pub reward_reputation: u64,
    pub tier: String,

    pub title: String,
    pub description: String, // ipfs cid

    pub assignee: Option<Pubkey>, // contributor record
    pub assigned_at: Option<i64>,

    pub completed_at: Option<i64>,
}
