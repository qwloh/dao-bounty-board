use crate::state::bounty_board::*;
use anchor_lang::prelude::*;

pub fn close_bounty_board(ctx: Context<CloseBountyBoard>) -> Result<()> {
    let bounty_board = &ctx.accounts.bounty_board;
    msg!("Bounty board account {} closed!", bounty_board.key());
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountyBoard<'info> {
    #[account(mut, close=user)]
    pub bounty_board: Account<'info, BountyBoard>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
