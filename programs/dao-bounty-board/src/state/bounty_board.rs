use crate::errors::BountyBoardError;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

fn get_bounty_board_address_seeds<'a>(realm: &'a Pubkey) -> [&'a [u8]; 2] {
    [PROGRAM_AUTHORITY_SEED, realm.as_ref()]
}

pub fn get_bounty_board_signer_seeds_ingredients<'a>(realm: &'a Pubkey) -> ([&'a [u8]; 2], u8) {
    let bounty_board_address_seeds = get_bounty_board_address_seeds(realm);
    let (address_from_seeds, bump_seed) =
        Pubkey::find_program_address(&bounty_board_address_seeds[..], &crate::ID);

    msg!(
        "Generated program address: {:?}. Bump: {:?}",
        address_from_seeds,
        bump_seed
    );

    (bounty_board_address_seeds, bump_seed)
}

pub fn get_default_role(bounty_board: &Account<BountyBoard>) -> Result<[u8; 24]> {
    let roles = &bounty_board.config.roles;
    let default_role = roles.iter().find(|r| r.default);
    match default_role {
        Some(role) => Ok(role.role_name),
        None => Err(BountyBoardError::NoDefaultRoleConfigured.into()),
    }
}

pub fn map_str_to_bytes<const N: usize>(string: &str) -> [u8; N] {
    let mut string_in_bytes = string.try_to_vec().unwrap_or(vec![0u8]);
    string_in_bytes.resize(N + 4, 0u8); // try_to_vec add 4 extra bytes before actual value to store size of vec
    return string_in_bytes[4..N + 4].try_into().unwrap(); // we don't want the first 4 bytes
}

/// seeds: PROGRAM_AUTHORITY_SEED, realm_pk
#[account]
pub struct BountyBoard {
    pub realm: Pubkey,
    pub authority: Pubkey,
    pub dummy: String,
    pub config: BountyBoardConfig,
    pub bounty_index: u64,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct BountyBoardConfig {
    pub tiers: Vec<BountyTier>,
    pub roles: Vec<RoleSetting>,
    pub last_revised: i64,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
pub struct BountyTier {
    // ~92 per tier
    pub tier_name: [u8; 24],
    pub difficulty_level: String,

    pub min_required_reputation: u32, // 4, same size as defined in Bounty, to prevent overflow in reputation in contributor_record which allows negative value
    pub min_required_skills_pt: u64,  // 8

    pub reputation_reward: u32, // 4
    pub skills_pt_reward: u64,  // 8
    pub payout_reward: u64,     // 8
    pub payout_mint: Pubkey,    // 32

    pub task_submission_window: u32,    // 4, duration in seconds
    pub submission_review_window: u32,  // 4, duration in seconds
    pub address_change_req_window: u32, // 4, duration in seconds
}

// a bit of an overkill
// just to show how flexible it could be in the future ba
#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Permission {
    CreateBounty,
    UpdateBounty,
    DeleteBounty,
    AssignBounty,
    RequestChangeToSubmission,
    AcceptSubmission,
    RejectSubmission,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
pub struct RoleSetting {
    pub role_name: [u8; 24],
    pub permissions: Vec<Permission>,
    pub default: bool,
}
