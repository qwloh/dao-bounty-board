use anchor_lang::error_code;

#[error_code]
pub enum BountyBoardError {
    BountyAlreadyAssigned,
    BountyApplicationExpired,
    #[msg("Attempt to reinitialize tiers")]
    TiersAlreadyConfigured,
    MinWaitTimeNotReached,
    NoDefaultRoleConfigured,
    NotAuthorizedToCreateBounty,
}
