import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";
import { Fragment } from "react";
import { DEV_WALLET_2, DUMMY_MINT_PK } from "../../../api/constants";
import { useBountyBoardByRealm } from "../../../hooks/bounty-board/useBountyBoardByRealm";
import { DEFAULT_CONFIG } from "../../../hooks/bounty-board/useProposeInitBountyBoard";
import { useUserProposalEntitiesInRealm } from "../../../hooks/realm/useUserProposalEntitiesInRealm";
import { ActiveProposals } from "./ActiveProposals";
import { BountyBoardVaults } from "./BountyBoardVaults";
import { ProposeInitBountyBoardBtn } from "./ProposeInitBountyBoardBtn";

export const BountyBoard = ({ realm }: { realm: string }) => {
  const { data: bountyBoard, isLoading } = useBountyBoardByRealm(realm);
  const { data: userProposalEntitiesInRealm } =
    useUserProposalEntitiesInRealm(realm);

  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex gap-x-6">
        <div className="basis-2/3 max-h-72 min-w-0 p-6 bg-white rounded-lg overflow-y-scroll">
          <div className="text-lg font-bold">Bounty Board</div>
          <p>The realm's bounty board (realm is Self DAO in this demo)</p>
          {bountyBoard?.account && (
            <div className="py-2">
              <div className="text-slate-800 p-2 bg-slate-100 rounded-lg break-words">
                {JSON.stringify(bountyBoard)}
              </div>
            </div>
          )}
          {!bountyBoard?.account && !isLoading && (
            <div className="text-slate-800 py-2">Bounty board not set up</div>
          )}
        </div>
        <div className="basis-1/3 max-h-72 min-w-0 p-6 rounded-lg bg-white overflow-y-scroll">
          <div className="font-bold">Bounty board vaults</div>
          <p>Token accounts that hold funds available for bounty payments</p>
          <BountyBoardVaults realm={realm} />
        </div>
      </div>
      <div className="h-64 p-6 flex flex-col gap-y-4 bg-white break-words rounded-lg overflow-y-scroll">
        <div className="text-lg font-bold">Active Proposals</div>
        <p>
          If no bounty board is set up yet (i.e. the above panel is empty),
          check if any other DAO members has already initiate a proposal to set
          up the bounty board. If there exists an active proposal, this hook /
          component return relevant data that direct users to vote on the
          existing proposal.
        </p>
        <ActiveProposals realm={realm} />
      </div>
      <div className="p-6 bg-white break-words rounded-lg">
        <div className="text-lg font-bold">Propose Set Up Bounty Board</div>
        <p>
          If the first panel is empty (i.e. no bounty board yet), user can
          initiate a new proposal (perhaps no other member has initiated a
          proposal yet or he disagrees with the existing proposals). Button
          below triggers the action with default bounty board config (with
          adjustments to Entry tier config to ease testing).
        </p>
        <ProposeInitBountyBoardBtn
          realm={realm}
          args={{
            userProposalEntity:
              userProposalEntitiesInRealm &&
              userProposalEntitiesInRealm.find((e) => e.council),
            boardConfig: {
              roles: DEFAULT_CONFIG.roles,
              tiers: DEFAULT_CONFIG.tiers.map((t) => {
                switch (t.tierName) {
                  case "Entry":
                    t.taskSubmissionWindow = 5 * 60; // 5 min, to make testing unassignOverdueBounty easy
                    t.submissionReviewWindow = 5 * 60;
                    t.addressChangeReqWindow = 5 * 60; // to make testing rejectStaleSubmission easy
                  case "A":
                    t.minRequiredSkillsPt = new BN(0);
                    t.minRequiredReputation = 0;
                  default:
                }
                return t;
              }),
            },
            firstVaultMint: new PublicKey(DUMMY_MINT_PK.USDC),
            amountToFundBountyBoardVault: 100000000, // 100 usdc
            initialContributorsWithRole: [
              {
                roleName: "Core",
                contributorWallet: new PublicKey(DEV_WALLET_2),
              },
            ],
          }}
        />
        <p>
          Note: When creating a proposal, if user has both council tokens and
          community tokens in a realm, he can choose which token should the
          proposal be voted on. This could be exposed as an option to the user
          on the config form, and passed as an argument to the
          `proposeInitBountyBoard` method. In this demo, we simply take the
          council token.
        </p>
        <p>
          To illustrate, below are my "identity" in Self DAO realm, a.k.a. types
          of voting token I hold →
        </p>
        <div className="grid grid-cols-[max-content_1fr] py-3 gap-x-6">
          <div>Token</div>
          <div>Council</div>
          {!!userProposalEntitiesInRealm?.length &&
            userProposalEntitiesInRealm.map((e) => (
              <Fragment key={e.governingTokenMint.toString()}>
                <div className="text-slate-800">
                  {e.governingTokenMint + ""}
                </div>
                <div className="text-slate-800">{e.council ? "Y" : "N"}</div>
              </Fragment>
            ))}
        </div>
      </div>
    </div>
  );
};
