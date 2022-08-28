use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_activity::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn update_submission(ctx: Context<UpdateSubmission>, data: UpdateSubmissionVM) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let bounty_activity = &mut ctx.accounts.bounty_activity;
    let contributor_record = &ctx.accounts.contributor_record;
    let contributor_wallet = &ctx.accounts.contributor_wallet;
    let clock = &ctx.accounts.clock;

    // only original assignee is authorized to submit work
    require_keys_eq!(
        bounty_submission.assignee,
        contributor_record.key(),
        BountyBoardError::NotAssignee,
    );
    // submission state can only be either PendingReview or ChangeRequested
    require!(
        matches!(
            bounty_submission.state,
            BountySubmissionState::PendingReview | BountySubmissionState::ChangeRequested
        ),
        BountyBoardError::SubmissionAlreadyConcluded
    );

    // 1. update `bounty_submission` state
    bounty_submission.link_to_submission = data.link_to_submission;
    bounty_submission.state = BountySubmissionState::PendingReview;
    bounty_submission.updated_at = Some(clock.unix_timestamp);

    // 2. create `bounty_activity`
    bounty_activity.bounty = bounty.key();
    bounty_activity.activity_index = bounty.activity_index;
    bounty_activity.timestamp = clock.unix_timestamp;
    bounty_activity.payload = BountyActivityPayload::UpdateSubmission {
        assignee_wallet: *contributor_wallet.key,
        submission_index: bounty_submission.submission_index,
    };

    // 3. Update `bounty` activity_index
    bounty.activity_index += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateSubmission<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>, // for contributor record seed derivation

    #[account(mut, seeds = [PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &(bounty.assign_count - 1).to_le_bytes()], bump)]
    pub bounty_submission: Account<'info, BountySubmission>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_activity", &bounty.activity_index.to_le_bytes()], bump, payer = contributor_wallet, space=500)]
    pub bounty_activity: Account<'info, BountyActivity>,

    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

    #[account(mut)]
    pub contributor_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]

pub struct UpdateSubmissionVM {
    pub link_to_submission: String,
}
