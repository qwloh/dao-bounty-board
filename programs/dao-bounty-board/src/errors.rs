use anchor_lang::error_code;

#[error_code]
pub enum BountyBoardError {
    // add tier config
    #[msg("Attempt to reinitialize tiers")]
    TiersAlreadyConfigured,
    // create bounty
    NotAuthorizedToCreateBounty,
    // apply to bounty
    NoDefaultRoleConfigured,
    // assign bounty
    BountyApplicationExpired,
    // assign or delete bounty
    BountyAlreadyAssigned,
    // submit to bounty
    NotAssignee,
    // request change to submission
    NotAuthorizedToReviewSubmission,
    // update submission
    SubmissionAlreadyConcluded,
    // reject submission
    MinWaitTimeNotReached,
}
