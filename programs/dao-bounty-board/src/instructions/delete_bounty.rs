use crate::errors::BountyBoardError;
pub use crate::state::bounty::*;
pub use crate::state::contributor_record::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use anchor_spl::token::{close_account, transfer, CloseAccount, Token, TokenAccount, Transfer};

pub fn delete_bounty(ctx: Context<DeleteBounty>) -> Result<()> {
    let bounty = &ctx.accounts.bounty;
    let bounty_escrow = &ctx.accounts.bounty_escrow;
    let bounty_board_vault = &ctx.accounts.bounty_board_vault;
    let contributor_record = &ctx.accounts.contributor_record;
    let user = &ctx.accounts.user;
    let token_program = &ctx.accounts.token_program;

    require!(
        bounty.assign_count == bounty.unassign_count, // no assignee currently
        BountyBoardError::BountyAlreadyAssigned
    );
    // in the future do permission based check to allow non creator delete bounty as well
    require_keys_eq!(contributor_record.key(), bounty.creator);

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

    msg!("Bounty escrow account {} closed!", bounty_escrow.key());
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

    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty.bounty_board.as_ref(), b"contributor_record", &user.key().as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
