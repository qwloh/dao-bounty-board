use anchor_lang::prelude::*;
use instructions::*;

/// Seed prefix for Bounty Board  PDAs
/// Note: This prefix is used for the initial set of PDAs and shouldn't be used for any new accounts
/// All new PDAs should use a unique prefix to guarantee uniqueness for each account
pub const PROGRAM_AUTHORITY_SEED: &[u8] = b"bounty_board";

pub mod instructions;
pub mod state;

declare_id!("H72kd3NLBGpsc1DcPk5bnjJtu7BXzwNSDFa2BeVQaTEL");

#[program]
pub mod dao_bounty_board {
    use super::*;

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
