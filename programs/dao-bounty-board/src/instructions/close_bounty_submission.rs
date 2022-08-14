use crate::state::bounty_submission::*;
use anchor_lang::prelude::*;

pub fn close_bounty_submission(ctx: Context<CloseBountySubmission>) -> Result<()> {
    let bounty_submission = &ctx.accounts.bounty_submission;
    msg!(
        "Bounty submission account {} closed!",
        bounty_submission.key()
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountySubmission<'info> {
    #[account(mut, close=user)]
    pub bounty_submission: Account<'info, BountySubmission>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
