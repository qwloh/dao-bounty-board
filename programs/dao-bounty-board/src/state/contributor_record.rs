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
    pub initialized: bool, // 1, need to keep track of this because we called 'init_if_needed' when apply_to_bounty

    pub bounty_board: Pubkey,      // 32
    pub realm: Pubkey,             // 32, to associate rep & skill pts to a DAO
    pub associated_wallet: Pubkey, // 32
    pub role: String,              // unknown

    pub reputation: i64,          // 8, can be negative
    pub skills_pt: Vec<SkillsPt>, // unknown

    // pub submission_count: u32,
    pub bounty_completed: u32,  // 4
    pub recent_rep_change: i64, // 8, can be negative
}
