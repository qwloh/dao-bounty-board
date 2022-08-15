use crate::state::bounty::*;
use crate::state::bounty_board::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount},
};
use std::mem::size_of;

// instruction method

pub fn create_bounty(ctx: Context<CreateBounty>, data: BountyVM) -> Result<()> {
    let bounty_board = &mut ctx.accounts.bounty_board;
    let bounty_board_vault = &mut ctx.accounts.bounty_board_vault;
    let bounty = &mut ctx.accounts.bounty;

    let sender = &mut ctx.accounts.user;
    let clock = &ctx.accounts.clock;

    // TODO: validate bounty.contributor_record has sufficient role
    // transfer funds from bounty board vault to bounty escrow

    bounty.bounty_index = bounty_board.bounty_count;

    // better way to write this?
    bounty.title = data.title;
    bounty.description = data.description;
    bounty.bounty_board = data.bounty_board;
    bounty.state = BountyState::Open;
    bounty.creator = *sender.key;
    bounty.created_at = clock.unix_timestamp;
    bounty.skill = data.skill;
    bounty.tier = data.tier;

    // bounty.reward_payout =
    // bounty.reward_mint =
    // bounty.reward_skill_pt =
    // bounty.reward_reputation =

    // update bounty board count
    msg!("Current bounty count: {}", bounty_board.bounty_count);
    bounty_board.bounty_count += 1;
    msg!("Updated bounty count: {}", bounty_board.bounty_count);

    // transfer reward payout from bounty board vault to bounty escrow

    msg!(&format!("{}", bounty.created_at));

    Ok(())
}

// instructions component: accounts involved

#[derive(Accounts)]
pub struct CreateBounty<'info> {
    #[account(mut)]
    pub bounty_board: Account<'info, BountyBoard>, // read config, update bounty count
    #[account(
        mut,
        associated_token::mint = reward_mint,
        associated_token::authority = bounty_board,
    )]
    pub bounty_board_vault: Box<Account<'info, TokenAccount>>,

    #[account(init, seeds= [PROGRAM_AUTHORITY_SEED, &bounty_board.key().as_ref(), b"bounty", &bounty_board.bounty_count.to_le_bytes()], bump, payer = user, space = 8000)]
    pub bounty: Account<'info, Bounty>,
    #[account(
        init,
        payer = user,
        associated_token::mint = reward_mint,
        associated_token::authority = bounty,
    )]
    pub bounty_escrow: Box<Account<'info, TokenAccount>>,

    pub reward_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}

// instructions component: data buffer

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct BountyVM {
    pub title: String,
    pub description: String,
    pub bounty_board: Pubkey,
    pub tier: String,
    pub skill: Skill,
}
