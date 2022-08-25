use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use get_size::GetSize;

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
    msg!(
        "Arguments to seeds. Bounty board address: {:?}. Bounty board index: {:?}",
        bounty_board,
        bounty_index_le_bytes
    );

    let bounty_address_seeds = get_bounty_address_seeds(bounty_board, bounty_index_le_bytes);
    let (address_from_seeds, bump_seed) =
        Pubkey::find_program_address(&bounty_address_seeds[..], &crate::ID);

    msg!(
        "Generated program address: {:?}. Bump: {}",
        address_from_seeds,
        bump_seed
    );

    (bounty_address_seeds, bump_seed)
}

#[derive(GetSize, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BountyState {
    Open,
    Assigned,
    SubmissionUnderReview,
    CompleteAndPaid,
}

// hard coded skills type for ALL DAOs
#[derive(GetSize, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Skill {
    Development,
    Design,
    Marketing,
    Operations,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_board_pk, "bounty", bounty_index
#[account]
#[derive(GetSize)]
pub struct Bounty {
    // seeds related info
    // move to top for easy filter
    #[get_size(ignore)]
    pub bounty_board: Pubkey, // 32
    pub bounty_index: u64, // 8, same type as bounty_board.bounty_count

    pub state: BountyState, // 1

    #[get_size(ignore)]
    pub creator: Pubkey, // 32, contributor record
    pub created_at: i64, // 8, UnixTimestamp ni seconds

    pub title: String,       // unknown
    pub description: String, // unknown, ipfs cid
    pub skill: Skill,        // 1
    pub tier: String,        // unknown

    pub task_submission_window: u32,    // 4, duration in seconds
    pub submission_review_window: u32,  // 4, duration in seconds
    pub address_change_req_window: u32, // 4, duration in seconds

    #[get_size(ignore)]
    pub reward_mint: Pubkey, // 32
    pub reward_payout: u64,           // 8
    pub reward_skill_pt: u64,         // 8
    pub reward_reputation: u32,       // 8
    pub min_required_reputation: u32, // 4, same size as defined in Bounty, to prevent overflow in reputation in contributor_record which allows negative value
    pub min_required_skills_pt: u64,  // 8

    pub assign_count: u8,   // 1, 256 is a reasonable number
    pub unassign_count: u8, // 1

    pub activity_index: u16, // 2, 65,536, reasonable number imo

    pub completed_at: Option<i64>, // 8
}
