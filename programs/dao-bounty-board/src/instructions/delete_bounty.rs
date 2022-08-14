use crate::errors::BountyBoardError;
pub use crate::state::bounty::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{close_account, CloseAccount, Token, TokenAccount};

pub fn delete_bounty(ctx: Context<DeleteBounty>) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let bounty_escrow = &ctx.accounts.bounty_escrow;
    let user = &ctx.accounts.user;
    let token_program = &ctx.accounts.token_program;

    require!(
        bounty.assignee == Option::None,
        BountyBoardError::BountyAlreadyAssigned
    );

    // handle bounty escrow

    // generate signer seeds
    let bounty_index_le_bytes = bounty.bounty_index.to_le_bytes();
    let (bounty_address_seed, bump_seed) =
        get_bounty_signer_seeds_ingredients(&bounty.bounty_board, &bounty_index_le_bytes[..]);
    let mut bounty_signer_seeds = bounty_address_seed.to_vec();
    let bump = &[bump_seed];
    bounty_signer_seeds.push(bump);
    let signers_seeds = &[&bounty_signer_seeds[..]];

    // transfer funds from bounty escrow back to bounty vault
    let token_amt = bounty_escrow.amount;
    if token_amt != 0 {
        // let transfer_instruction =
        // invoke_signed(instruction, account_infos, signers_seeds)
    }

    // close bounty escrow
    let close_instruction = CloseAccount {
        account: bounty_escrow.to_account_info(),
        destination: user.to_account_info(),
        authority: bounty.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        close_instruction,
        &signers_seeds[..],
    );

    close_account(cpi_ctx)?;

    msg!("Bounty board vault account {} closed!", bounty_escrow.key());
    msg!("Bounty account {} closed!", bounty.key());
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteBounty<'info> {
    #[account(mut, close=user)]
    pub bounty: Account<'info, Bounty>,

    #[account(
        mut,
        associated_token::mint = bounty_escrow.mint,
        associated_token::authority = bounty.bounty_board,
    )]
    pub bounty_board_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bounty_escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
