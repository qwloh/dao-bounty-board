use crate::state::bounty::*;
use anchor_lang::prelude::*;

pub fn close_bounty(ctx: Context<CloseBounty>) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    msg!("Bounty account {} closed!", bounty.key());
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBounty<'info> {
    #[account(mut, close=user)]
    pub bounty: Account<'info, Bounty>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
