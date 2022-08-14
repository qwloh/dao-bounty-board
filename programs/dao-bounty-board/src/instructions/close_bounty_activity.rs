use crate::state::bounty_activity::*;
use anchor_lang::prelude::*;

pub fn close_bounty_activity(ctx: Context<CloseBountyActivity>) -> Result<()> {
    let bounty_activity = &ctx.accounts.bounty_activity;
    msg!("Bounty activity account {} closed!", bounty_activity.key());
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountyActivity<'info> {
    #[account(mut, close=user)]
    pub bounty_activity: Account<'info, BountyActivity>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
