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
    pub tier_name: String,
    pub difficulty_level: String,

    pub min_required_reputation: u64, // same size as defined in Bounty
    pub min_required_skills_pt: u64,

    pub reputation_reward: u64,
    pub skills_pt_reward: u64,
    pub payout_reward: u64,
    pub payout_mint: Pubkey,
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
