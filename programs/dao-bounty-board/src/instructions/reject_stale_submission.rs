use crate::errors::BountyBoardError;
use crate::state::{bounty::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn reject_stale_submission(
    ctx: Context<RejectStaleSubmission>,
    data: RejectStaleSubmissionVM,
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
        BountyBoardError::NotAuthorizedToRejectSubmission
    );

    let change_request_addressed = matches!(
        bounty_submission.state,
        BountySubmissionState::PendingReview
    );
    let change_request_to_be_addressed_by = bounty_submission.change_requested_at.unwrap()
        + i64::from(bounty.address_change_req_window);

    // assignee have not addressed change requested after expected response time fully elapsed
    require!(
        !change_request_addressed && clock.unix_timestamp > change_request_to_be_addressed_by,
        BountyBoardError::SubmissionNotStale
    );

    // update bounty_submission
    bounty_submission.state = BountySubmissionState::RejectedForUnaddressedChangeRequest;
    bounty_submission.rejected_at = Some(clock.unix_timestamp);

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

    // data.comment is used when creating BountyActivity

    Ok(())
}

#[derive(Accounts)]
pub struct RejectStaleSubmission<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    #[account(mut)]
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
pub struct RejectStaleSubmissionVM {
    pub comment: String,
}
