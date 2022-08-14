use crate::state::bounty_submission::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

pub fn submit_to_bounty(ctx: Context<SubmitToBounty>, data: SubmitToBountyVM) -> Result<()> {
    let bounty_submission = &mut ctx.accounts.bounty_submission;
    let clock = &ctx.accounts.clock;

    bounty_submission.bounty = data.bounty_pk;
    bounty_submission.link_to_submission = data.link_to_submission;
    bounty_submission.contributor_record = data.contributor_record_pk;
    bounty_submission.state = BountySubmissionState::PendingReview;
    bounty_submission.request_change_count = 0;
    bounty_submission.first_submitted_at = clock.unix_timestamp;

    Ok(())
}

#[derive(Accounts)]
#[instruction(data: SubmitToBountyVM)]
pub struct SubmitToBounty<'info> {
    #[account(init, seeds = [PROGRAM_AUTHORITY_SEED, &data.bounty_pk.as_ref(), b"bounty_submission", &data.contributor_record_pk.as_ref()], bump, payer = contributor_wallet, space = 2500 )]
    pub bounty_submission: Account<'info, BountySubmission>,

    // add bounty and contributor record to account to
    // check contributor record is derived from bounty_board_pk & contributor_wallet
    #[account(mut)]
    pub contributor_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct SubmitToBountyVM {
    bounty_pk: Pubkey,
    link_to_submission: String, // ipfs in the future
    contributor_record_pk: Pubkey,
}
