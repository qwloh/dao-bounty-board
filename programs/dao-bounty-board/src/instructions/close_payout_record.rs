use crate::state::payout_record::*;
use anchor_lang::prelude::*;

pub fn close_payout_record(ctx: Context<ClosePayoutRecord>) -> Result<()> {
    let payout_record = &ctx.accounts.payout_record;
    msg!("Payout record account {} closed!", payout_record.key());
    Ok(())
}

#[derive(Accounts)]
pub struct ClosePayoutRecord<'info> {
    #[account(mut, close=user)]
    pub payout_record: Account<'info, PayoutRecord>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
