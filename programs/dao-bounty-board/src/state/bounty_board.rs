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

pub fn get_default_role(bounty_board: &Account<BountyBoard>) -> Result<String> {
    let roles = &bounty_board.config.roles;
    let default_role = roles.iter().find(|r| r.default);
    match default_role {
        Some(role) => Ok(role.role_name.clone()),
        None => Err(BountyBoardError::NoDefaultRoleConfigured.into()),
    }
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
    pub tier_name: String,
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
    pub role_name: String,
    pub permissions: Vec<Permission>,
    pub default: bool,
}
