use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ContributorRole {
    CORE,
    CONTRIBUTOR,
}

#[account]
pub struct ContributorRecord {
    /// Role
    pub role: ContributorRole,

    /// Reputation
    pub reputation: u128,
}
