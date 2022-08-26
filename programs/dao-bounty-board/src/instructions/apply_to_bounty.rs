use crate::errors::BountyBoardError;
use crate::state::{
    bounty::*, bounty_activity::*, bounty_application::*, bounty_board::*, contributor_record::*,
};
use crate::PROGRAM_AUTHORITY_SEED;
use anchor_lang::prelude::*;
use std::mem::size_of;

pub fn apply_to_bounty(ctx: Context<ApplyToBounty>, data: ApplyToBountyVM) -> Result<()> {
    let bounty_board = &ctx.accounts.bounty_board;
    let bounty = &mut ctx.accounts.bounty;
    let bounty_application = &mut ctx.accounts.bounty_application;
    let bounty_activity = &mut ctx.accounts.bounty_activity;
    let contributor_record = &mut ctx.accounts.contributor_record;
    let applicant = &ctx.accounts.applicant;
    let clock = &ctx.accounts.clock;

    // find the skills point for the skill involved in this bounty
    let applicant_skills_pt = contributor_record
        .skills_pt
        .iter()
        .find(|t| t.skill == bounty.skill)
        .unwrap_or(&SkillsPt {
            skill: Skill::Design, // skill doesn't matter, just a placeholder
            point: 0,
        })
        .point;
    require_gte!(
        applicant_skills_pt,
        bounty.min_required_skills_pt,
        BountyBoardError::InsufficientSkillsPt
    );
    require_gte!(
        contributor_record.reputation,
        i64::from(bounty.min_required_reputation),
        BountyBoardError::InsufficientReputation
    );

    // populate fields in `bounty_application`
    bounty_application.bounty = bounty.key();
    bounty_application.applicant = *applicant.key;
    bounty_application.contributor_record = contributor_record.key();
    bounty_application.validity = data.validity;
    bounty_application.applied_at = clock.unix_timestamp;
    bounty_application.status = BountyApplicationStatus::NotAssigned;

    // fill in fields in `bounty_activity`
    bounty_activity.bounty = bounty.key();
    bounty_activity.activity_index = bounty.activity_index;
    bounty_activity.timestamp = clock.unix_timestamp;
    bounty_activity.payload = BountyActivityPayload::Apply {
        applicant_wallet: *applicant.key,
    };

    // increment activity_index on `bounty`
    bounty.activity_index += 1;

    msg!(
        "Contributor record account {} initialized: {}",
        contributor_record.key(),
        contributor_record.initialized
    );
    if !contributor_record.initialized {
        msg!(
            "Account {} does not exist yet. Initializing",
            contributor_record.key()
        );
        // run initialization code
        contributor_record.initialized = true;

        contributor_record.bounty_board = bounty_board.key();
        contributor_record.realm = bounty_board.realm;
        contributor_record.associated_wallet = applicant.key();

        // require data.role_name is present in bounty_board.config.roles
        contributor_record.role = get_default_role(bounty_board)?;

        // initialize to 0
        contributor_record.reputation = 0;
        contributor_record.skills_pt = Vec::new();

        contributor_record.bounty_completed = 0;
        contributor_record.recent_rep_change = 0;
    }

    Ok(())
}

#[derive(Accounts)]
#[instruction(data:ApplyToBountyVM)]
pub struct ApplyToBounty<'info> {
    pub bounty_board: Box<Account<'info, BountyBoard>>, // only need this for seeds of contributor_record

    #[account(mut)]
    pub bounty: Account<'info, Bounty>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_application", &contributor_record.key().as_ref()], bump, payer = applicant, space=size_of::<BountyApplication>() )]
    pub bounty_application: Account<'info, BountyApplication>,

    #[account(init, seeds=[PROGRAM_AUTHORITY_SEED, &bounty.key().as_ref(), b"bounty_activity", &bounty.activity_index.to_le_bytes()], bump, payer = applicant, space=500)]
    pub bounty_activity: Account<'info, BountyActivity>,

    #[account(init_if_needed, seeds=[PROGRAM_AUTHORITY_SEED, &bounty_board.key().as_ref(), b"contributor_record", &applicant.key().as_ref()], bump, payer = applicant, space=500)]
    pub contributor_record: Account<'info, ContributorRecord>,

    #[account(mut)]
    pub applicant: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct ApplyToBountyVM {
    pub validity: u64,
}
