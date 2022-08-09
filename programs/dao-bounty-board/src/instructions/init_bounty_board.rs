use crate::state::bounty_board::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;

// instruction method

pub fn init_bounty_board(ctx: Context<InitBountyBoard>, data: InitBountyBoardVM) -> Result<()> {
    let bounty_board = &mut ctx.accounts.bounty_board;
    let realm_governance = &mut ctx.accounts.realm_governance;

    bounty_board.realm = data.realm_pk;
    bounty_board.config = data.config;
    bounty_board.bounty_count = 0; // initialize bounty count to zero
    bounty_board.update_authority = *realm_governance.key;

    Ok(())
}

// instructions component: accounts involved

#[derive(Accounts)]
#[instruction(data: InitBountyBoardVM)]
pub struct InitBountyBoard<'info> {
    #[account(init, seeds= [PROGRAM_AUTHORITY_SEED, &data.realm_pk.as_ref()], bump, payer = user, space = 5000)]
    pub bounty_board: Account<'info, BountyBoard>,

    pub realm_governance: Signer<'info>,

    /// could change the payer to DAO treasury in the future?
    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

// instructions component: data buffer

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct InitBountyBoardVM {
    /// DAO the bounty board belongs to
    pub realm_pk: Pubkey,
    pub config: BountyBoardConfig,
}
