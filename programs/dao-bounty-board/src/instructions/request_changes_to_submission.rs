use crate::state::{bounty::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn request_changes_to_submission(
    ctx: Context<RequestChangesToSubmission>,
    data: RequestChangesToSubmissionVM,
) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let contributor_record = &ctx.accounts.contributor_record;
    let clock = &ctx.accounts.clock;

    // contributor_record must be bounty creator
    require_keys_eq!(bounty.creator, contributor_record.key());

    bounty_submission.state = BountySubmissionState::ChangeRequested;
    bounty_submission.change_requested_at = Some(clock.unix_timestamp);
    bounty_submission.request_change_count += 1;

    // data.comment is used when creating BountyActivity

    Ok(())
}

#[derive(Accounts)]
pub struct RequestChangesToSubmission<'info> {
    pub bounty: Account<'info, Bounty>,
    #[account(mut)]
    pub bounty_submission: Account<'info, BountySubmission>,
    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,
    pub contributor_wallet: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct RequestChangesToSubmissionVM {
    pub comment: String,
}