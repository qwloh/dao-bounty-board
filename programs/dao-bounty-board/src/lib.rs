use anchor_lang::prelude::*;
use instructions::*;
use state::BountyBoard;

/// Seed prefix for Bounty Board  PDAs
/// Note: This prefix is used for the initial set of PDAs and shouldn't be used for any new accounts
/// All new PDAs should use a unique prefix to guarantee uniqueness for each account
pub const PROGRAM_AUTHORITY_SEED: &[u8] = b"bounty_board";

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("8wEnvDw8rQoWQXsCvE3ALt5bEuB8FeA8A52N5Uacjayh");

#[program]
pub mod dao_bounty_board {
    use super::*;

    // DAO interfacing fn

    pub fn init_bounty_board(ctx: Context<InitBountyBoard>, data: InitBountyBoardVM) -> Result<()> {
        instructions::init_bounty_board(ctx, data)
    }

    pub fn add_bounty_board_tier_config(
        ctx: Context<AddBountyBoardTierConfig>,
        data: AddBountyBoardTierConfigVM,
    ) -> Result<()> {
        instructions::add_bounty_board_tier_config(ctx, data)
    }

    pub fn update_bounty_board(
        ctx: Context<UpdateBountyBoard>,
        data: UpdateBountyBoardVM,
    ) -> Result<()> {
        instructions::update_bounty_board(ctx, data)
    }

    pub fn add_contributor_with_role(
        ctx: Context<AddContributorWithRole>,
        data: AddContributorWithRoleVM,
    ) -> Result<()> {
        instructions::add_contributor_with_role(ctx, data)
    }

    // "admin fn"

    pub fn create_bounty(ctx: Context<CreateBounty>, data: BountyVM) -> Result<()> {
        instructions::create_bounty(ctx, data)
    }

    pub fn assign_bounty(ctx: Context<AssignBounty>) -> Result<()> {
        instructions::assign_bounty(ctx)
    }

    pub fn unassign_overdue_bounty(
        ctx: Context<UnassignOverdueBounty>,
        data: UnassignOverdueBountyVM,
    ) -> Result<()> {
        instructions::unassign_overdue_bounty(ctx, data)
    }

    pub fn delete_bounty(ctx: Context<DeleteBounty>) -> Result<()> {
        instructions::delete_bounty(ctx)
    }

    pub fn request_changes_to_submission(
        ctx: Context<RequestChangesToSubmission>,
        data: RequestChangesToSubmissionVM,
    ) -> Result<()> {
        instructions::request_changes_to_submission(ctx, data)
    }

    pub fn accept_submission(
        ctx: Context<AcceptSubmission>,
        data: AcceptSubmissionVM,
    ) -> Result<()> {
        instructions::accept_submission(ctx, data)
    }

    pub fn reject_submission(
        ctx: Context<RejectSubmission>,
        data: RejectSubmissionVM,
    ) -> Result<()> {
        instructions::reject_submission(ctx, data)
    }

    pub fn reject_stale_submission(
        ctx: Context<RejectStaleSubmission>,
        data: RejectStaleSubmissionVM,
    ) -> Result<()> {
        instructions::reject_stale_submission(ctx, data)
    }

    // "contributor fn"

    pub fn apply_to_bounty(ctx: Context<ApplyToBounty>, data: ApplyToBountyVM) -> Result<()> {
        instructions::apply_to_bounty(ctx, data)
    }

    pub fn submit_to_bounty(ctx: Context<SubmitToBounty>, data: SubmitToBountyVM) -> Result<()> {
        instructions::submit_to_bounty(ctx, data)
    }

    pub fn update_submission(
        ctx: Context<UpdateSubmission>,
        data: UpdateSubmissionVM,
    ) -> Result<()> {
        instructions::update_submission(ctx, data)
    }

    pub fn force_accept_submission(
        ctx: Context<ForceAcceptSubmission>,
        data: ForceAcceptSubmissionVM,
    ) -> Result<()> {
        instructions::force_accept_submission(ctx, data)
    }

    pub fn bookmark_bounty(ctx: Context<BookmarkBounty>, data: BookmarkBountyVM) -> Result<()> {
        instructions::bookmark_bounty(ctx, data)
    }

    /**
     * Dev purpose
     */
    pub fn close_bounty_board(ctx: Context<CloseBountyBoard>) -> Result<()> {
        instructions::close_bounty_board(ctx)
    }

    pub fn close_bounty_board_vault(ctx: Context<CloseBountyBoardVault>) -> Result<()> {
        instructions::close_bounty_board_vault(ctx)
    }

    pub fn close_bounty(ctx: Context<CloseBounty>) -> Result<()> {
        instructions::close_bounty(ctx)
    }

    pub fn close_bounty_escrow(ctx: Context<CloseBountyEscrow>) -> Result<()> {
        instructions::close_bounty_escrow(ctx)
    }

    pub fn close_bounty_application(ctx: Context<CloseBountyApplication>) -> Result<()> {
        instructions::close_bounty_application(ctx)
    }

    pub fn close_contributor_record(ctx: Context<CloseContributorRecord>) -> Result<()> {
        instructions::close_contributor_record(ctx)
    }

    pub fn close_payout_record(ctx: Context<ClosePayoutRecord>) -> Result<()> {
        instructions::close_payout_record(ctx)
    }

    pub fn close_bounty_submission(ctx: Context<CloseBountySubmission>) -> Result<()> {
        instructions::close_bounty_submission(ctx)
    }

    pub fn close_bounty_activity(ctx: Context<CloseBountyActivity>) -> Result<()> {
        instructions::close_bounty_activity(ctx)
    }
    pub fn close_bounty_bookmark(ctx: Context<CloseBountyBookmark>) -> Result<()> {
        instructions::close_bounty_bookmark(ctx)
    }

    // test fn
    pub fn test(ctx: Context<TestPayload>) -> Result<()> {
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

        Ok(())
    }
}

#[derive(Accounts)]

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
}
