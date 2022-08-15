use crate::state::{bounty::*, bounty_submission::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn update_submission(ctx: Context<UpdateSubmission>, data: UpdateSubmissionVM) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let contributor_record = &ctx.accounts.contributor_record;
    let clock = &ctx.accounts.clock;

    // contributor record must be assignee
    require_keys_eq!(
        bounty.assignee.unwrap_or(Pubkey::default()),
        contributor_record.key()
    );
    // submission state must be change requested?

    bounty_submission.link_to_submission = data.link_to_submission;
    bounty_submission.state = BountySubmissionState::PendingReview;
    bounty_submission.updated_at = Some(clock.unix_timestamp);

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateSubmission<'info> {
    pub bounty: Account<'info, Bounty>,
    #[account(mut, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_submission", &contributor_record.key().as_ref()], bump)]
    pub bounty_submission: Account<'info, BountySubmission>,
    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &contributor_wallet.key.as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,
    pub contributor_wallet: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]

pub struct UpdateSubmissionVM {
    pub link_to_submission: String,
}
