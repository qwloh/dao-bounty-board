use crate::state::bounty_board::*;
use anchor_lang::prelude::*;

// instruction method

pub fn update_bounty_board(
    ctx: Context<UpdateBountyBoard>,
    data: UpdateBountyBoardVM,
) -> Result<()> {
    let bounty_board = &mut ctx.accounts.bounty_board;

    let realm_governance = &mut ctx.accounts.realm_governance;
    require!(realm_governance.is_signer, ErrorCode::AccountNotSigner);
    require_keys_eq!(
        realm_governance.key(),
        bounty_board.authority.key(),
        ErrorCode::AccountNotSigner
    );

    bounty_board.config = data.config;

    Ok(())
}

// instructions component: accounts involved

#[derive(Accounts)]
pub struct UpdateBountyBoard<'info> {
    #[account(mut)]
    pub bounty_board: Account<'info, BountyBoard>,

    pub realm_governance: Signer<'info>,
}

// instructions component: data buffer
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct UpdateBountyBoardVM {
    pub config: BountyBoardConfig,
}
