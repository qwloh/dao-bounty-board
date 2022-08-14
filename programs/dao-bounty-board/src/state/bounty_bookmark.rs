use anchor_lang::prelude::*;

/// seeds: PROGRAM_AUTHORITY_SEED, user_wallet_pk, "bounty_bookmark", bounty_pk
#[account]
pub struct BountyBookmark {
    pub bounty: Pubkey,
    pub realm: Pubkey,
    pub user: Pubkey,
    pub removable: bool,
}
