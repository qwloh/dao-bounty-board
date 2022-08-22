use crate::errors::BountyBoardError;
use crate::state::bounty::*;
use crate::state::bounty_submission::*;
use crate::state::contributor_record::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn submit_to_bounty(ctx: Context<SubmitToBounty>, data: SubmitToBountyVM) -> Result<()> {
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let bounty = &mut ctx.accounts.bounty;
    let contributor_record = &ctx.accounts.contributor_record;
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

    // populate fields for submission obj
    bounty_submission.state = BountySubmissionState::PendingReview;
    bounty_submission.link_to_submission = data.link_to_submission;
    bounty_submission.first_submitted_at = Some(clock.unix_timestamp);

    // update bounty state
    bounty.state = BountyState::SubmissionUnderReview;

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitToBounty<'info> {
    // seed check?
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,

    #[account(mut, seeds = [PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &(bounty.assign_count - 1).to_le_bytes()], bump)]
    pub bounty_submission: Account<'info, BountySubmission>,

    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key().as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

    pub contributor_wallet: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct SubmitToBountyVM {
    link_to_submission: String, // ipfs in the future
}
