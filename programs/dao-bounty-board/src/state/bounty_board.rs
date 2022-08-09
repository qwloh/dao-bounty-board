use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use std::collections::BTreeMap;

/// Returns Bounty Board PDA seeds
pub fn get_bounty_address_seeds<'a>(realm: &'a Pubkey) -> [&'a [u8]; 2] {
    [PROGRAM_AUTHORITY_SEED, realm.as_ref()] // assume one realm only can have one bounty board
}

#[account]
pub struct BountyBoard {
    pub realm: Pubkey,
    pub update_authority: Pubkey,
    pub dummy: String,
    pub config: BountyBoardConfig,
    pub bounty_count: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct BountyBoardConfig {
    pub tiers: Vec<BountyTierConfig>,
    pub roles: u64,
    pub functions: u64,
    pub last_revised: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
pub struct BountyTierConfig {
    pub tier_name: String,
    pub difficulty_level: String,

    pub min_required_reputation: u32,
    pub min_required_skills_pt: u32,

    pub reputation_reward: u32,
    pub skills_pt_reward: u32,
    pub payout_reward: u32,
    pub payout_mint: Pubkey,
}
