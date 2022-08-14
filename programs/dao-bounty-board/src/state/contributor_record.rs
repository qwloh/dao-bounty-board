use super::Skill;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct SkillsPt {
    pub skill: Skill,
    pub point: u64,
}

/// seeds: PROGRAM_AUTHORITY_SEED, bounty_board_pk, "contributor_record", user_wallet_pk
#[account]
pub struct ContributorRecord {
    pub initialized: bool, // need to keep track of this because we called 'init_if_needed' when apply_to_bounty

    pub bounty_board: Pubkey,
    pub realm: Pubkey, // to associate rep & skill pts to a DAO
    pub associated_wallet: Pubkey,
    pub role: String,

    pub reputation: u64,
    pub skills_pt: Vec<SkillsPt>,

    // pub submission_count: u32,
    pub bounty_completed: u32,
    pub recent_rep_change: u32,
}
