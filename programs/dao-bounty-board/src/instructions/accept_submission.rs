use crate::state::bounty_submission::*;
use anchor_lang::prelude::*;

pub fn accept_submission(ctx: Context<AcceptSubmission>, data: AcceptSubmissionVM) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct AcceptSubmission<'info> {
    pub bounty_submission: Account<'info, BountySubmission>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct AcceptSubmissionVM {}
