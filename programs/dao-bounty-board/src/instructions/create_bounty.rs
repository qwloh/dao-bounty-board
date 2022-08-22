use crate::errors::BountyBoardError;
use crate::state::bounty::*;
use crate::state::bounty_board::*;
use crate::state::contributor_record::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};
use get_size::GetSize;

// instruction method

pub fn create_bounty(ctx: Context<CreateBounty>, data: BountyVM) -> Result<()> {
    let bounty_board = &mut ctx.accounts.bounty_board;
    let bounty_board_vault = &mut ctx.accounts.bounty_board_vault;
    let bounty = &mut ctx.accounts.bounty;
    let bounty_escrow = &ctx.accounts.bounty_escrow;
    let contributor_record = &ctx.accounts.contributor_record;

    let sender = &mut ctx.accounts.user;
    let token_program = &ctx.accounts.token_program;
    let clock = &ctx.accounts.clock;

    // validate bounty.contributor_record has sufficient role
    let role_setting = bounty_board
        .config
        .roles
        .iter()
        .find(|r| r.role_name == contributor_record.role)
        .unwrap();
    require!(
        role_setting
            .permissions
            .iter()
            .any(|p| matches!(p, Permission::CreateBounty)),
        BountyBoardError::NotAuthorizedToCreateBounty
    );

    // 1. populate data on bounty account
    bounty.bounty_board = data.bounty_board;
    msg!("Current bounty count: {}", bounty_board.bounty_index);
    bounty.bounty_index = bounty_board.bounty_index;

    bounty.state = BountyState::Open;

    bounty.creator = contributor_record.key();
    bounty.created_at = clock.unix_timestamp;

    bounty.title = data.title;
    bounty.description = data.description;
    bounty.duration_in_hr = data.duration_in_hr;
    bounty.skill = data.skill;
    bounty.tier = data.tier;

    let tier_reward_config = bounty_board
        .config
        .tiers
        .iter()
        .find(|t| t.tier_name == bounty.tier)
        .unwrap();
    bounty.reward_mint = tier_reward_config.payout_mint;
    bounty.reward_payout = tier_reward_config.payout_reward;
    bounty.reward_skill_pt = tier_reward_config.skills_pt_reward;
    bounty.reward_reputation = tier_reward_config.reputation_reward;

    // 2. update bounty_index on bounty_board
    bounty_board.bounty_index += 1;
    msg!("Updated bounty count: {}", bounty_board.bounty_index);

    // 3. transfer reward payout from bounty board vault to bounty escrow

    // generate signer seeds
    let (bounty_board_address_seed, bump_seed) =
        get_bounty_board_signer_seeds_ingredients(&bounty_board.realm);
    let mut bounty_board_signer_seeds = bounty_board_address_seed.to_vec();
    let bump = &[bump_seed];
    bounty_board_signer_seeds.push(bump);
    let signers_seeds = &[&bounty_board_signer_seeds[..]];

    // setup transfer instruction and ctx
    let transfer_instruction = Transfer {
        from: bounty_board_vault.to_account_info(),
        to: bounty_escrow.to_account_info(),
        authority: bounty_board.to_account_info(),
    };

    let cpi_ctx_trf = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_instruction,
        &signers_seeds[..],
    );

    // invoke transfer
    let token_amt = bounty.reward_payout;
    transfer(cpi_ctx_trf, token_amt)?;

    msg!(
        "Bounty board vault balance {} transferred to {}!",
        token_amt,
        bounty_escrow.key()
    );

    msg!("Bounty account size {:?}", bounty.get_size() + 32 * 4);

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

    #[account(init, seeds= [PROGRAM_AUTHORITY_SEED, &bounty_board.key().as_ref(), b"bounty", &bounty_board.bounty_index.to_le_bytes()], bump, payer = user, space = 8000)]
    pub bounty: Box<Account<'info, Bounty>>,
    #[account(
        init,
        payer = user,
        associated_token::mint = reward_mint,
        associated_token::authority = bounty,
    )]
    pub bounty_escrow: Box<Account<'info, TokenAccount>>,

    pub reward_mint: Account<'info, Mint>, // here for seeds of bounty_board_vault and bounty_escrow

    #[account(seeds=[PROGRAM_AUTHORITY_SEED, &bounty_board.key().as_ref(), b"contributor_record", &user.key().as_ref()], bump)]
    pub contributor_record: Account<'info, ContributorRecord>,

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
    pub bounty_board: Pubkey,
    pub title: String,
    pub description: String,
    pub duration_in_hr: u16, // expected task duration in hours
    pub tier: String,
    pub skill: Skill,
}
