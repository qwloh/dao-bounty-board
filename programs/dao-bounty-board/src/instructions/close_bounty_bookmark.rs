use crate::state::bounty_bookmark::*;
use anchor_lang::prelude::*;

pub fn close_bounty_bookmark(ctx: Context<CloseBountyBookmark>) -> Result<()> {
    let bounty_bookmark = &ctx.accounts.bounty_bookmark;
    msg!("Bounty bookmark account {} closed!", bounty_bookmark.key());
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountyBookmark<'info> {
    #[account(mut, close=user)]
    pub bounty_bookmark: Account<'info, BountyBookmark>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
