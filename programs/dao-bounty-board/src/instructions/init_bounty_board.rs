use crate::errors::BountyBoardError;
use crate::state::bounty_board::*;
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

// instruction method

pub fn init_bounty_board(ctx: Context<InitBountyBoard>, data: InitBountyBoardVM) -> Result<()> {
    let bounty_board = &mut ctx.accounts.bounty_board;
    let realm_governance = &ctx.accounts.realm_governance;
    let clock = &ctx.accounts.clock;

    // validate roles
    require!(
        data.roles.iter().any(|r| r.default),
        BountyBoardError::NoDefaultRoleConfigured
    );

    bounty_board.realm = data.realm_pk;
    bounty_board.config = BountyBoardConfig {
        roles: data
            .roles
            .iter()
            .map(|r| map_vm_to_role_setting(r))
            .collect::<Vec<RoleSetting>>(),
        tiers: Vec::new(),
        last_revised: clock.unix_timestamp,
    };
    bounty_board.bounty_index = 0; // initialize bounty count to zero
    bounty_board.authority = *realm_governance.key;

    Ok(())
}

// instructions component: accounts involved

#[derive(Accounts)]
#[instruction(data: InitBountyBoardVM)]
pub struct InitBountyBoard<'info> {
    // create bounty board acc
    #[account(init, seeds= [PROGRAM_AUTHORITY_SEED, &data.realm_pk.as_ref()], bump, payer =user, space = 5000)]
    pub bounty_board: Account<'info, BountyBoard>,
    pub realm_governance: Signer<'info>,

    // set up first vault for bounty board
    #[account(
        init,
        payer = user,
        associated_token::mint = first_vault_mint,
        associated_token::authority = bounty_board,
    )]
    pub bounty_board_vault: Account<'info, TokenAccount>,
    pub first_vault_mint: Account<'info, Mint>,

    /// could change the payer to DAO treasury in the future?
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
pub struct InitBountyBoardVM {
    /// DAO the bounty board belongs to
    pub realm_pk: Pubkey,
    pub roles: Vec<RoleSettingVM>,
}

#[derive(Debug, AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Default)]
pub struct RoleSettingVM {
    pub role_name: String,
    pub permissions: Vec<Permission>,
    pub default: bool,
}

fn map_vm_to_role_setting(role_vm: &RoleSettingVM) -> RoleSetting {
    RoleSetting {
        role_name: map_str_to_bytes::<24>(&role_vm.role_name[..]),
        permissions: role_vm.permissions.clone(),
        default: role_vm.default,
    }
}
