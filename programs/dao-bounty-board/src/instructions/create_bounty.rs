use crate::state::bounty::*;
use anchor_lang::prelude::*;
use std::mem::size_of;

// instruction method

pub fn create_bounty(ctx: Context<CreateBounty>, data: BountyVM) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;

    // TODO: validate bounty.contributor_record has sufficient role

    // better way to write this?
    bounty.bounty_board = data.bounty_board;
    bounty.title = data.title;
    bounty.contributor_record = data.contributor_record;
    let clock = Clock::get()?;
    bounty.created_at = clock.unix_timestamp;
    msg!(&format!("{}", bounty.created_at));
    bounty.state = BountyState::OPEN;

    Ok(())
}

// instructions component: accounts involved

#[derive(Accounts)]
pub struct CreateBounty<'info> {
    #[account(init, seeds= [b"test9"], bump, payer = user, space = size_of::<Bounty>())]
    pub bounty: Account<'info, Bounty>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// instructions component: data buffer

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct BountyVM {
    /// Bounty board the bounty belongs to
    pub bounty_board: Pubkey,

    /// Bounty title
    pub title: String,

    /// The ContributorRecord representing the user who created and owns this Bounty
    /// Only contributors with certain roles are authorized to do this
    pub contributor_record: Pubkey,
}
