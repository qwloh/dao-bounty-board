use crate::state::contributor_record::*;
use anchor_lang::prelude::*;

pub fn close_contributor_record(ctx: Context<CloseContributorRecord>) -> Result<()> {
    let contributor_record = &ctx.accounts.contributor_record;
    msg!(
        "Contributor record account {} closed!",
        contributor_record.key()
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CloseContributorRecord<'info> {
    #[account(mut, close=user)]
    pub contributor_record: Account<'info, ContributorRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
