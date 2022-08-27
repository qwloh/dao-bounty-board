use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_activity::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn reject_submission(ctx: Context<RejectSubmission>, data: RejectSubmissionVM) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let bounty_activity = &mut ctx.accounts.bounty_activity;
    let contributor_record = &ctx.accounts.contributor_record;
    let contributor_wallet = &ctx.accounts.contributor_wallet;
    let clock = &ctx.accounts.clock;

    // contributor_record must be bounty creator
    require_keys_eq!(
        bounty.creator,
        contributor_record.key(),
        BountyBoardError::NotAuthorizedToRejectSubmission
    );

    // submission state must be pendingReview, i.e. contributor has addressed changes requested
    let change_request_addressed = matches!(
        bounty_submission.state,
        BountySubmissionState::PendingReview,
    );
    // option only available after 3 iterations between reviewer (creator) and assignee
    require!(
        change_request_addressed && bounty_submission.request_change_count >= 3,
        BountyBoardError::MinIterationCountNotReached
    );

    // 1. update `bounty_submission` state
    bounty_submission.state = BountySubmissionState::Rejected;
    bounty_submission.rejected_at = Some(clock.unix_timestamp);

    // No need to deduct contributor reputation?

    // 2. create `bounty_activity`
    bounty_activity.bounty = bounty.key();
    bounty_activity.activity_index = bounty.activity_index;
    bounty_activity.timestamp = clock.unix_timestamp;
    bounty_activity.payload = BountyActivityPayload::Reject {
        actor_wallet: *contributor_wallet.key,
        submission_index: bounty_submission.submission_index,
        comment: data.comment,
    };

    // 3. unassign bounty & increment activity_index
    bounty.state = BountyState::Open;
    bounty.unassign_count += 1;
    bounty.activity_index += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct RejectSubmission<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    #[account(mut)]
    pub bounty_submission: Account<'info, BountySubmission>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_activity", &bounty.activity_index.to_le_bytes()], bump, payer = contributor_wallet, space=500)]
    pub bounty_activity: Account<'info, BountyActivity>,

    /// bounty creator contributor record
    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

    #[account(mut)]
    pub contributor_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct RejectSubmissionVM {
    pub comment: String,
}
