use crate::state::{bounty::*, bounty_bookmark::*};
use anchor_lang::prelude::*;

pub fn bookmark_bounty(_ctx: Context<BookmarkBounty>, _data: BookmarkBountyVM) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct BookmarkBounty<'info> {
    pub bounty: Account<'info, Bounty>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct BookmarkBountyVM {}
