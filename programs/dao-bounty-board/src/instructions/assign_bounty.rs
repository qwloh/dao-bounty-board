use crate::{
    errors::BountyBoardError,
    state::{bounty::*, bounty_application::*},
};
use anchor_lang::prelude::*;

pub fn assign_bounty(ctx: Context<AssignBounty>) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_application = &mut ctx.accounts.bounty_application;
    let clock = &ctx.accounts.clock;

    require!(
        bounty.assignee == Option::None,
        BountyBoardError::BountyAlreadyAssigned
    );

    // check application validity

    bounty.state = BountyState::Assigned;
    bounty.assignee = Some(bounty_application.contributor_record);
    bounty.assigned_at = Some(clock.unix_timestamp);

    bounty_application.status = BountyApplicationStatus::Assigned;

    Ok(())
}

#[derive(Accounts)]
pub struct AssignBounty<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    #[account(mut)]
    pub bounty_application: Account<'info, BountyApplication>,
    pub clock: Sysvar<'info, Clock>,
}
