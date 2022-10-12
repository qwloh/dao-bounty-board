import { useActiveBountyBoardProposals } from "../../../hooks/bounty-board/useActiveBountyBoardProposals";
import { useRealm } from "../../../hooks/realm/useRealm";

export const ActiveProposals = ({ realm }: { realm: string }) => {
  const { data: realmAcc } = useRealm(realm);
  const { data: activeProposals, isLoading } =
    useActiveBountyBoardProposals(realm);

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {!activeProposals?.length && !isLoading && (
        <div className="text-slate-800 py-2">No active proposals</div>
      )}

      {!!activeProposals?.length &&
        activeProposals.map((p, i) => (
          <div
            key={p.pubkey.toString()}
            className="p-4 rounded-lg bg-slate-100 flex flex-col gap-y-2"
          >
            <a
              href={`https://app.realms.today/dao/${realmAcc?.pubkey}/proposal/${p.pubkey}?cluster=devnet`}
              target="_blank"
              className="text-blue-400"
            >
              Proposal {i + 1}
            </a>
            <div className="grid grid-cols-[132px_1fr] gap-x-4 gap-y-2">
              <p className="text-slate-800">Initial contributors</p>
              <div className="break-words whitespace-pre-wrap min-w-0">
                {JSON.stringify(p.account.boardConfig.initialContributors)}
              </div>
              <p className="text-slate-800">Seed bounty board vault with</p>
              <div className="break-words whitespace-pre-wrap min-w-0">
                {p.account.boardConfig.amountToFundBountyBoardVault / 1000000}{" "}
                {p.account.boardConfig.firstVaultMint + " (Token address)"}
              </div>
              <p className="text-slate-800">Roles</p>
              <div className="break-words whitespace-pre-wrap min-w-0">
                {JSON.stringify(p.account.boardConfig.roles)}
              </div>
              <p className="text-slate-800">Tiers</p>
              <div className="break-words whitespace-pre-wrap min-w-0">
                {JSON.stringify(p.account.boardConfig.tiers)}
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

// export declare class ProposalTransaction {
//   accountType: GovernanceAccountType;
//   proposal: PublicKey;
//   instructionIndex: number;
//   instruction: InstructionData;
//   optionIndex: number;
//   instructions: InstructionData[];
//   holdUpTime: number;
//   executedAt: BN | null;
//   executionStatus: InstructionExecutionStatus;
// }

// export declare function getProposalTransactionAddress(
//   programId: PublicKey,
//   programVersion: number,
//   proposal: PublicKey,
//   optionIndex: number,
//   transactionIndex: number
// ): Promise<PublicKey>;

// export declare enum ProposalState {
//   Draft = 0,
//   SigningOff = 1,
//   Voting = 2,
//   Succeeded = 3,
//   Executing = 4,
//   Completed = 5,
//   Cancelled = 6,
//   Defeated = 7,
//   ExecutingWithErrors = 8,
// }
// export declare enum OptionVoteResult {
//   None = 0,
//   Succeeded = 1,
//   Defeated = 2,
// }
// export declare class ProposalOption {
//   label: string;
//   voteWeight: BN;
//   voteResult: OptionVoteResult;
//   instructionsExecutedCount: number;
//   instructionsCount: number;
//   instructionsNextIndex: number;
// }
// export declare class Proposal {
//   accountType: GovernanceAccountType;
//   governance: PublicKey;
//   governingTokenMint: PublicKey;
//   state: ProposalState;
//   tokenOwnerRecord: PublicKey;
//   signatoriesCount: number;
//   signatoriesSignedOffCount: number;
//   yesVotesCount: BN;
//   noVotesCount: BN;
//   instructionsExecutedCount: number;
//   instructionsCount: number;
//   instructionsNextIndex: number;
//   voteType: VoteType;
//   options: ProposalOption[];
//   denyVoteWeight: BN | undefined;
//   vetoVoteWeight: BN | undefined;
//   abstainVoteWeight: BN | undefined;
//   startVotingAt: BN | null;
//   maxVotingTime: number | null;
//   draftAt: BN;
//   signingOffAt: BN | null;
//   votingAt: BN | null;
//   votingAtSlot: BN | null;
//   votingCompletedAt: BN | null;
//   executingAt: BN | null;
//   closedAt: BN | null;
//   executionFlags: InstructionExecutionFlags;
//   maxVoteWeight: BN | null;
//   voteThresholdPercentage: VoteThresholdPercentage | null;
//   name: string;
//   descriptionLink: string;
// }
