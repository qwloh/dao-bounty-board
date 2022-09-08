use crate::errors::BountyBoardError;
use crate::state::bounty_board::*;
use anchor_lang::prelude::*;

// separate this method from

pub fn add_bounty_board_tier_config(
    ctx: Context<AddBountyBoardTierConfig>,
    data: AddBountyBoardTierConfigVM,
) -> Result<()> {
    let bounty_board = &mut ctx.accounts.bounty_board;

    require!(
        bounty_board.config.tiers.len() == 0,
        BountyBoardError::TiersAlreadyConfigured
    ); // must be uninitialized

    bounty_board.config.tiers = data
        .tiers
        .iter()
        .map(|t| map_vm_to_bounty_tier(t))
        .collect::<Vec<BountyTier>>();
    Ok(())
}

#[derive(Accounts)]
pub struct AddBountyBoardTierConfig<'info> {
    #[account(mut)]
    pub bounty_board: Account<'info, BountyBoard>,
    pub realm_governance: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct AddBountyBoardTierConfigVM {
    tiers: Vec<BountyTierVM>,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
pub struct BountyTierVM {
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

fn map_vm_to_bounty_tier(tier_vm: &BountyTierVM) -> BountyTier {
    BountyTier {
        tier_name: map_str_to_bytes::<24>(&tier_vm.tier_name[..]),
        difficulty_level: tier_vm.difficulty_level.clone(),

        min_required_reputation: tier_vm.min_required_reputation,
        min_required_skills_pt: tier_vm.min_required_skills_pt,

        reputation_reward: tier_vm.reputation_reward,
        skills_pt_reward: tier_vm.skills_pt_reward,
        payout_reward: tier_vm.payout_reward,
        payout_mint: tier_vm.payout_mint,

        task_submission_window: tier_vm.task_submission_window,
        submission_review_window: tier_vm.submission_review_window,
        address_change_req_window: tier_vm.address_change_req_window,
    }
}
