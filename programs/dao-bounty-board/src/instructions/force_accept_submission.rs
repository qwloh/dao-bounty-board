use crate::state::bounty_submission::*;
use anchor_lang::prelude::*;

pub fn force_accept_submission(
    ctx: Context<ForceAcceptSubmission>,
    data: ForceAcceptSubmissionVM,
) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
pub struct ForceAcceptSubmission<'info> {
    pub bounty_submission: Account<'info, BountySubmission>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct ForceAcceptSubmissionVM {}
