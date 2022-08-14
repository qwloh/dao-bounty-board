use crate::state::bounty_application::*;
use anchor_lang::prelude::*;

pub fn close_bounty_application(ctx: Context<CloseBountyApplication>) -> Result<()> {
    let bounty_application = &ctx.accounts.bounty_application;
    msg!(
        "Bounty application account {} closed!",
        bounty_application.key()
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountyApplication<'info> {
    #[account(mut, close=user)]
    pub bounty_application: Account<'info, BountyApplication>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
