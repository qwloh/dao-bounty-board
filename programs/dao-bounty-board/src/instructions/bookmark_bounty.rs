use crate::state::{bounty_bookmark::*, bounty::*};
use anchor_lang::prelude::*;

pub fn bookmark_bounty(ctx: Context<BookmarkBounty>, data: BookmarkBountyVM) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct BookmarkBounty<'info> {
    pub bounty: Account<'info, Bounty>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct BookmarkBountyVM {}
