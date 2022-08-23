use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn reject_submission(ctx: Context<RejectSubmission>, data: RejectSubmissionVM) -> Result<()> {
    let bounty = &mut ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let contributor_record = &ctx.accounts.contributor_record;
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

    bounty_submission.state = BountySubmissionState::Rejected;
    bounty_submission.rejected_at = Some(clock.unix_timestamp);

    // unassign bounty
    bounty.state = BountyState::Open;
    bounty.unassign_count += 1;

    // No need to deduct contributor reputation?

    // data.comment is used when creating BountyActivity

    Ok(())
}

#[derive(Accounts)]
pub struct RejectSubmission<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    #[account(mut)]
    pub bounty_submission: Account<'info, BountySubmission>,

    /// bounty creator contributor record
    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,
    pub contributor_wallet: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct RejectSubmissionVM {
    pub comment: String,
}
