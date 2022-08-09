use anchor_lang::prelude::*;
use instructions::*;
use state::BountyBoard;

use num_derive::*;
use num_traits::*;

/// Seed prefix for Bounty Board  PDAs
/// Note: This prefix is used for the initial set of PDAs and shouldn't be used for any new accounts
/// All new PDAs should use a unique prefix to guarantee uniqueness for each account
pub const PROGRAM_AUTHORITY_SEED: &[u8] = b"bounty_board";

pub mod instructions;
pub mod state;

declare_id!("5A1DLgMJbQPUnhfFR6pCpDYVTuGn9YBjiW4aCatm41tH");

#[program]
pub mod dao_bounty_board {
    use super::*;

    // test fn
    pub fn test(ctx: Context<TestPayload>, data: TestData) -> Result<()> {
        // 1. compare PDA
        // let (key, bump) = Pubkey::find_program_address(
        //     &[PROGRAM_AUTHORITY_SEED, data.realm_key.as_ref()],
        //     &data.program_id,
        // );
        // msg!(
        //     "Seeds: {:?}",
        //     &[PROGRAM_AUTHORITY_SEED, data.realm_key.as_ref()]
        // );
        // msg!("Derived PDA: {}", key);

        // 2. close account
        let acc_to_close = &mut ctx.accounts.acc_to_close;
        msg!("Account {} closed!", acc_to_close.key());

        // 3. test nested enum
        // let enum_pda = &mut ctx.accounts.enum_pda;
        // enum_pda.test_enum_1 = TestEnum::from_u8(0u8).unwrap();
        // enum_pda.test_enum_2 = TestEnum::from_u8(1u8).unwrap();
        // // enum_pda.test_enum_3 = TestEnum::B(B::OptionThree);
        // // enum_pda.test_enum_4 = TestEnum::B(B::OptionFour);
        // msg!("Account {} created!", enum_pda.key());
        // msg!("Test enum 1: {}", enum_pda.test_enum_1.to_u8().unwrap());
        // msg!("Test enum 2: {}", enum_pda.test_enum_2.to_u8().unwrap());

        // 4. close nested enum acc
        // let enum_pda = &mut ctx.accounts.enum_pda;
        // msg!("Account {} closed!", enum_pda.key());

        Ok(())
    }

    // DAO interfacing fn

    pub fn init_bounty_board(ctx: Context<InitBountyBoard>, data: InitBountyBoardVM) -> Result<()> {
        instructions::init_bounty_board::init_bounty_board(ctx, data)
    }

    pub fn update_bounty_board(
        ctx: Context<UpdateBountyBoard>,
        data: UpdateBountyBoardVM,
    ) -> Result<()> {
        instructions::update_bounty_board::update_bounty_board(ctx, data)
    }

    // "admin fn"

    pub fn create_bounty(ctx: Context<CreateBounty>, data: BountyVM) -> Result<()> {
        instructions::create_bounty::create_bounty(ctx, data)
    }

    pub fn assign_bounty(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    pub fn delete_bounty(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    pub fn request_changes(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    pub fn accept_submission(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    pub fn reject_submission(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    // "contributor fn"

    pub fn apply_to_bounty(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    pub fn submit_work(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }

    pub fn update_submission(_ctx: Context<CreateBounty>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(data: TestData)]
pub struct TestPayload<'info> {
    // 1. compare PDA
    // #[account(init, seeds= [PROGRAM_AUTHORITY_SEED, &data.realm_key.as_ref()], bump, payer = user, space = 32)]
    // pub test_pda: Account<'info, TestAcc>,
    // #[account(mut)]
    // pub user: Signer<'info>,
    // pub system_program: Program<'info, System>,

    // 2. test close account
    #[account(mut, close=user)]
    pub acc_to_close: Account<'info, BountyBoard>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
    // // 3. test nested enums
    // #[account(init, seeds=[b"test_enum"], bump, payer = user, space = 100)]
    // pub enum_pda: Account<'info, TestAcc>,
    // #[account(mut)]
    // pub user: Signer<'info>,
    // pub system_program: Program<'info, System>,
    // // 4. close nested enum acc
    // #[account(mut, close=user)]
    // pub enum_pda: Account<'info, TestAcc>,
    // #[account(mut)]
    // pub user: Signer<'info>,
    // pub system_program: Program<'info, System>,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]

pub enum B {
    OptionThree,
    OptionFour,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]

pub enum A {
    OptionOne,
    OptionTwo,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, FromPrimitive, ToPrimitive)]
pub enum TestEnum {
    A,
    B,
}

#[account]
pub struct TestAcc {
    pub counter: u8,
    pub test_enum_1: TestEnum,
    pub test_enum_2: TestEnum,
    // pub test_enum_3: TestEnum,
    // pub test_enum_4: TestEnum,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct TestData {
    pub program_id: Pubkey,
    // pub realm_key: Pubkey,
}
