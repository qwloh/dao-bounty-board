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
    InsufficientReputation,
    InsufficientSkillsPt,
    // assign bounty
    BountyApplicationExpired,
    // assign or delete bounty
    BountyAlreadyAssigned,
    // submit to bounty
    NotAssignee,
    #[msg("Non blank submission. Do you meant to call update_submission instead?")]
    NonBlankSubmission,
    // update submission
    SubmissionAlreadyConcluded,
    // request change to submission
    NotAuthorizedToReviewSubmission,
    ChangeRequestQuotaReached,
    // unassign overdue
    NotAuthorizedToUnassignBounty,
    NotOverdue,
    // reject submission
    NotAuthorizedToRejectSubmission,
    MinIterationCountNotReached,
    // reject stale submission
    SubmissionNotStale,
    MinWaitTimeNotReached,
    // request change / reject / approve submission,
    NotPendingReview,
}
