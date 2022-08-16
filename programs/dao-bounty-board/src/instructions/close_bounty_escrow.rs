use anchor_lang::prelude::*;
use anchor_spl::token::{close_account, transfer, CloseAccount, Token, TokenAccount, Transfer};

use crate::state::bounty::*;

pub fn close_bounty_escrow(ctx: Context<CloseBountyEscrow>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let bounty = &ctx.accounts.bounty;
    let bounty_escrow = &mut ctx.accounts.bounty_escrow;
    let bounty_board_vault = &ctx.accounts.bounty_board_vault;
    let token_program = &ctx.accounts.token_program;

    // generate signer seeds
    let bounty_index_le_bytes = bounty.bounty_index.to_le_bytes();
    let (bounty_address_seed, bump_seed) =
        get_bounty_signer_seeds_ingredients(&bounty.bounty_board, &bounty_index_le_bytes[..]);
    let mut bounty_signer_seeds = bounty_address_seed.to_vec();
    let bump = &[bump_seed];
    bounty_signer_seeds.push(bump);
    let signers_seeds = &[&bounty_signer_seeds[..]];

    // transfer out token
    let token_amt = bounty_escrow.amount;
    if token_amt != 0 {
        let transfer_instruction = Transfer {
            from: bounty_escrow.to_account_info(),
            to: bounty_board_vault.to_account_info(),
            authority: bounty.to_account_info(),
        };

        let cpi_ctx_trf = CpiContext::new_with_signer(
            token_program.to_account_info(),
            transfer_instruction,
            &signers_seeds[..],
        );

        transfer(cpi_ctx_trf, token_amt)?;

        msg!(
            "Bounty escrow balance {} transferred to {}!",
            token_amt,
            bounty_board_vault.key()
        );
    }

    // close acc
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
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountyEscrow<'info> {
    pub bounty: Account<'info, Bounty>,

    #[account(mut)]
    pub bounty_escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    pub bounty_board_vault: Account<'info, TokenAccount>,

    pub user: Signer<'info>,
    // typical stuff
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
