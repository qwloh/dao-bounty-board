use anchor_lang::error_code;

#[error_code]
pub enum BountyBoardError {
    BountyAlreadyAssigned,
    BountyApplicationExpired,
    NotAssignee,
    #[msg("Attempt to reinitialize tiers")]
    TiersAlreadyConfigured,
    MinWaitTimeNotReached,
    NoDefaultRoleConfigured,
    NotAuthorizedToCreateBounty,
}
