use crate::state::bounty_board::*;
use anchor_lang::prelude::*;

use anchor_spl::token::{close_account, transfer, CloseAccount, Token, TokenAccount, Transfer};

pub fn close_bounty_board_vault(ctx: Context<CloseBountyBoardVault>) -> Result<()> {
    let user = &ctx.accounts.user;
    let bounty_board = &ctx.accounts.bounty_board;
    let bounty_board_vault = &mut ctx.accounts.bounty_board_vault;
    let realm_treasury_ata = &ctx.accounts.realm_treasury_ata;
    let token_program = &ctx.accounts.token_program;

    // generate signer seeds
    let (bounty_board_address_seed, bump_seed) =
        get_bounty_board_signer_seeds_ingredients(&bounty_board.realm);
    let mut bounty_board_signer_seeds = bounty_board_address_seed.to_vec();
    let bump = &[bump_seed];
    bounty_board_signer_seeds.push(bump);
    let signers_seeds = &[&bounty_board_signer_seeds[..]];

    // transfer out token
    let token_amt = bounty_board_vault.amount;
    if token_amt != 0 {
        let transfer_instruction = Transfer {
            from: bounty_board_vault.to_account_info(),
            to: realm_treasury_ata.to_account_info(),
            authority: bounty_board.to_account_info(),
        };

        let cpi_ctx_trf = CpiContext::new_with_signer(
            token_program.to_account_info(),
            transfer_instruction,
            &signers_seeds[..],
        );

        transfer(cpi_ctx_trf, token_amt)?;

        msg!(
            "Bounty board vault balance {} transferred to {}!",
            token_amt,
            realm_treasury_ata.key()
        );
    }

    // close acc
    let close_instruction = CloseAccount {
        account: bounty_board_vault.to_account_info(),
        destination: user.to_account_info(),
        authority: bounty_board.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        close_instruction,
        &signers_seeds[..],
    );

    close_account(cpi_ctx)?;

    msg!(
        "Bounty board vault account {} closed!",
        bounty_board_vault.key()
    );
    Ok(())
}

#[derive(Accounts)]
pub struct CloseBountyBoardVault<'info> {
    pub bounty_board: Account<'info, BountyBoard>,

    #[account(mut)]
    pub bounty_board_vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub realm_treasury_ata: Account<'info, TokenAccount>, // token balance transferred back to DAO treasury
    pub user: Signer<'info>,

    // typical stuff
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
