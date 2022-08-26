use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_activity::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn unassign_overdue_bounty(
    ctx: Context<UnassignOverdueBounty>,
    data: UnassignOverdueBountyVM,
) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let bounty_activity = &mut ctx.accounts.bounty_activity;
    let assignee_contributor_record = &mut ctx.accounts.assignee_contributor_record;
    let contributor_record = &ctx.accounts.contributor_record;
    let contributor_wallet = &ctx.accounts.contributor_wallet;
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
    let deadline = bounty_submission.assigned_at + i64::from(bounty.task_submission_window);
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

    // 1. update `bounty_submission` state
    bounty_submission.state = BountySubmissionState::UnassignedForOverdue;
    bounty_submission.unassigned_at = Some(clock.unix_timestamp);

    // 2. deduct reputation from assignee_contributor_record (by same amount as reward)
    // negative reputation is possible
    assignee_contributor_record.reputation = contributor_record
        .reputation
        .saturating_sub(i64::from(bounty.reward_reputation));
    assignee_contributor_record.recent_rep_change =
        i64::from(bounty.reward_reputation).saturating_neg();

    // 3. create `bounty_activity`
    bounty_activity.bounty = bounty.key();
    bounty_activity.activity_index = bounty.activity_index;
    bounty_activity.timestamp = clock.unix_timestamp;
    bounty_activity.payload = BountyActivityPayload::UnassignOverdue {
        actor_wallet: *contributor_wallet.key,
        submission_index: bounty_submission.submission_index,
        assignee_wallet: assignee_contributor_record.associated_wallet,
        rep_deducted: bounty.reward_reputation,
    };

    // 4. unassign `bounty` & increment unassign_count & activity_index
    bounty.state = BountyState::Open;
    bounty.unassign_count += 1;
    bounty.activity_index += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct UnassignOverdueBounty<'info> {
    #[account(mut)]
    pub bounty: Box<Account<'info, Bounty>>,

    #[account(mut, seeds = [PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &(bounty.assign_count - 1).to_le_bytes()], bump)]
    pub bounty_submission: Account<'info, BountySubmission>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_activity", &bounty.activity_index.to_le_bytes()], bump, payer = contributor_wallet, space=500)]
    pub bounty_activity: Account<'info, BountyActivity>,

    /// assignee contributor record
    #[account(mut, address=bounty_submission.assignee)]
    pub assignee_contributor_record: Account<'info, ContributorRecord>,

    /// bounty creator contributor record
    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

    #[account(mut)]
    pub contributor_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct UnassignOverdueBountyVM {
    pub comment: String,
}
