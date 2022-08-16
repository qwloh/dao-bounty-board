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

    bounty_board.config.tiers = data.tiers;
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
    tiers: Vec<BountyTier>,
}
