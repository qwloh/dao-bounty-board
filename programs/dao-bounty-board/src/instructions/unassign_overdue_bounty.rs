use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn unassign_overdue_bounty(
    ctx: Context<UnassignOverdueBounty>,
    data: UnassignOverdueBountyVM,
) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let contributor_record = &ctx.accounts.contributor_record;
    let assignee_contributor_record = &mut ctx.accounts.assignee_contributor_record;
    let clock = &ctx.accounts.clock;

    // contributor_record must be bounty creator
    require_keys_eq!(
        bounty.creator,
        contributor_record.key(),
        BountyBoardError::NotAuthorizedToUnassignBounty
    );

    // check that assignee haven't made submission and deadline has passed
    let submission_still_pending = matches!(
        bounty_submission.state,
        BountySubmissionState::PendingSubmission
    );
    let deadline = bounty_submission.assigned_at + i64::from(bounty.duration);
    let deadline_crossed = clock.unix_timestamp > deadline;
    msg!(
        "Deadline: {}. Timestamp on chain: {}. Deadline crossed {}",
        deadline,
        clock.unix_timestamp,
        deadline_crossed
    );
    require!(
        submission_still_pending && deadline_crossed,
        BountyBoardError::NotOverdue
    );

    // update bounty_submission
    bounty_submission.state = BountySubmissionState::UnassignedForOverdue;
    bounty_submission.unassigned_at = Some(clock.unix_timestamp);

    // unassign bounty
    bounty.state = BountyState::Open;
    bounty.unassign_count += 1;

    // deduct reputation from contributor_record (by same amount as reward)
    // negative reputation is possible
    assignee_contributor_record.reputation = contributor_record
        .reputation
        .saturating_sub(i64::from(bounty.reward_reputation));
    assignee_contributor_record.recent_rep_change =
        i64::from(bounty.reward_reputation).saturating_neg();

    Ok(())
}

#[derive(Accounts)]
pub struct UnassignOverdueBounty<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,

    #[account(mut, seeds = [PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &(bounty.assign_count - 1).to_le_bytes()], bump)]
    pub bounty_submission: Account<'info, BountySubmission>,

    /// assignee contributor record
    #[account(mut, address=bounty_submission.assignee)]
    pub assignee_contributor_record: Account<'info, ContributorRecord>,

    /// bounty creator contributor record
    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,
    pub contributor_wallet: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct UnassignOverdueBountyVM {
    pub comment: String,
}
