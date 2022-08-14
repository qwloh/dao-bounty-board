use crate::state::{bounty_board::*, contributor_record::*};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

// normal progression via
pub fn add_contributor_with_role(
    ctx: Context<AddContributorWithRole>,
    data: AddContributorWithRoleVM,
) -> Result<()> {
    let bounty_board = &ctx.accounts.bounty_board;
    let contributor_record = &mut ctx.accounts.contributor_record;

    contributor_record.initialized = true;
    contributor_record.bounty_board = bounty_board.key();
    contributor_record.realm = bounty_board.realm;
    contributor_record.associated_wallet = data.contributor_wallet;

    // require data.role_name is present in bounty_board.config.roles
    contributor_record.role = data.role_name;

    // initialize to 0
    contributor_record.reputation = 0;
    contributor_record.skills_pt = Vec::new();

    contributor_record.bounty_completed = 0;
    contributor_record.recent_rep_change = 0;

    Ok(())
}

#[derive(Accounts)]
#[instruction(data: AddContributorWithRoleVM)]
pub struct AddContributorWithRole<'info> {
    pub bounty_board: Account<'info, BountyBoard>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty_board.key().as_ref(), b"contributor_record", &data.contributor_wallet.as_ref()], bump, payer = proposal_executor, space=500)]
    pub contributor_record: Account<'info, ContributorRecord>,

    pub realm_governance: Signer<'info>,

    #[account(mut)]
    pub proposal_executor: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct AddContributorWithRoleVM {
    pub contributor_wallet: Pubkey,
    pub role_name: String,
}
