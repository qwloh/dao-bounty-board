use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_activity::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn submit_to_bounty(ctx: Context<SubmitToBounty>, data: SubmitToBountyVM) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let bounty_activity = &mut ctx.accounts.bounty_activity;
    let contributor_record = &ctx.accounts.contributor_record;
    let contributor_wallet = &ctx.accounts.contributor_wallet;
    let clock = &ctx.accounts.clock;

    // validate caller is assignee
    require_keys_eq!(
        bounty_submission.assignee,
        contributor_record.key(),
        BountyBoardError::NotAssignee
    );

    // validate no prev submission has been made
    require!(
        matches!(
            bounty_submission.state,
            BountySubmissionState::PendingSubmission
        ),
        BountyBoardError::NonBlankSubmission
    );

    // 1. update `bounty_submission`
    bounty_submission.state = BountySubmissionState::PendingReview;
    bounty_submission.link_to_submission = data.link_to_submission;
    bounty_submission.first_submitted_at = Some(clock.unix_timestamp);

    // 2. create `bounty_activity`
    bounty_activity.bounty = bounty.key();
    bounty_activity.activity_index = bounty.activity_index;
    bounty_activity.timestamp = clock.unix_timestamp;
    bounty_activity.payload = BountyActivityPayload::Submit {
        assignee_wallet: *contributor_wallet.key,
        submission_index: bounty_submission.submission_index,
    };

    // 3. update `bounty` state & activity_index
    bounty.state = BountyState::SubmissionUnderReview;
    bounty.activity_index += 1;

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitToBounty<'info> {
    // seed check?
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,

    #[account(mut, seeds = [PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &(bounty.assign_count - 1).to_le_bytes()], bump)]
    pub bounty_submission: Account<'info, BountySubmission>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_activity", &bounty.activity_index.to_le_bytes()], bump, payer = contributor_wallet, space=500)]
    pub bounty_activity: Account<'info, BountyActivity>,

    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key().as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

    #[account(mut)]
    pub contributor_wallet: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct SubmitToBountyVM {
    link_to_submission: String, // ipfs in the future
}
