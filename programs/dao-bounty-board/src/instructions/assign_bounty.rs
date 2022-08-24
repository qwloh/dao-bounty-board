use crate::{
    errors::BountyBoardError,
    state::{bounty::*, bounty_application::*, bounty_submission::*},
    PROGRAM_AUTHORITY_SEED,
};
use anchor_lang::prelude::*;

pub fn assign_bounty(ctx: Context<AssignBounty>) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_application = &mut ctx.accounts.bounty_application;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let clock = &ctx.accounts.clock;

    require!(
        bounty.assign_count == bounty.unassign_count, // bounty currently not assigned
        BountyBoardError::BountyAlreadyAssigned
    );

    // check application validity
    let valid_until = bounty_application.applied_at + bounty_application.validity as i64;
    require!(
        valid_until > clock.unix_timestamp,
        BountyBoardError::BountyApplicationExpired
    );

    // 1. create blank 'bounty_submission' for assignee
    bounty_submission.bounty = bounty.key();
    bounty_submission.submission_index = bounty.assign_count;
    bounty_submission.assignee = bounty_application.contributor_record;
    bounty_submission.assigned_at = clock.unix_timestamp;
    bounty_submission.state = BountySubmissionState::PendingSubmission;

    // 2. update `bounty` state & assign_count
    bounty.state = BountyState::Assigned;
    bounty.assign_count += 1;

    // 3. update `bounty_application` status
    bounty_application.status = BountyApplicationStatus::Assigned;

    Ok(())
}

#[derive(Accounts)]
pub struct AssignBounty<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,

    #[account(mut)]
    pub bounty_application: Account<'info, BountyApplication>,

    // create blank bounty submission for assignee
    #[account(init, seeds = [PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &bounty.assign_count.to_le_bytes()], bump, payer = user, space = 2500 )]
    pub bounty_submission: Account<'info, BountySubmission>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}
