import { PublicKey } from "@solana/web3.js";
import React from "react";
import { TEST_REALM_PK } from "../../api/constants";
import { DEFAULT_CONFIG, getRolesInVec } from "../../api/utils";
import { useAnchorContext, useBountyBoard, useRealm } from "../../hooks";
import { useBounty } from "../../hooks/useBounty";

const QwComponent = () => {
  const { wallet } = useAnchorContext();

  const { realm, userRepresentationInDAO, realmTreasuries } = useRealm(
    new PublicKey(TEST_REALM_PK)
  );

  const {
    activeBountyBoardProposals, // if there is already any active ones, direct them to voting instead of letting them init new proposal
    bountyBoard,
    proposeInitBountyBoard,
    proposeUpdateBountyBoard,
  } = useBountyBoard(new PublicKey(TEST_REALM_PK));

  const { bounties, getBounty, createBounty } = useBounty(
    new PublicKey(TEST_REALM_PK)
  );

  return (
    <div
      style={{
        maxWidth: "700px",
        overflowWrap: "break-word",
        wordWrap: "break-word",
        wordBreak: "break-all",
      }}
    >
      <div>Realm</div>
      <div>
        <div>
          <strong>Realm Obj</strong>
        </div>
        <div>{JSON.stringify(realm)}</div>
      </div>
      <div>
        <div>
          <strong>User rep in DAO</strong>
        </div>
        <div>{JSON.stringify(userRepresentationInDAO)}</div>
      </div>
      <div>
        <div>
          <strong>Realm treasuries</strong>
        </div>
        <div>{JSON.stringify(realmTreasuries)}</div>
      </div>
      <div>
        <div>
          <strong>Active bounty proposal</strong>
        </div>
        <div>{JSON.stringify(activeBountyBoardProposals)}</div>
      </div>
      <div>
        <div>
          <strong>Bounty board </strong>(
          {bountyBoard?.publicKey && bountyBoard?.publicKey.toString()})
        </div>
        <div>{JSON.stringify(bountyBoard.account)}</div>
      </div>
      <div>
        <div>
          <strong>Propose Setup Bounty Board</strong>
        </div>
        <button
          onClick={() =>
            proposeInitBountyBoard({
              // @ts-ignore
              boardConfig: DEFAULT_CONFIG,
              fundingAmount: 10000000, // 10 USDC
              initialContributorsWithRole: [
                {
                  roleName: "Core",
                  contributorWallet: wallet.publicKey,
                },
              ],
            })
          }
        >
          Propose Init Bounty Board
        </button>
      </div>
      <div>
        <div>
          <strong>Propose Update Board Config</strong>
        </div>
        <div>{"Role name change: core -> core_updated"}</div>
        <button
          onClick={() =>
            proposeUpdateBountyBoard({
              ...DEFAULT_CONFIG,
              // @ts-ignore
              roles: getRolesInVec().map((r) =>
                r.roleName === "Core" ? { ...r, roleName: "Core_updated" } : r
              ),
            })
          }
        >
          Propose Update Bounty Board
        </button>
      </div>
      <div>
        <div>
          <strong>Bounties</strong>
        </div>
        <div>{JSON.stringify(bounties)}</div>
      </div>
      <div>
        <div>
          <strong>Create Bounty</strong>
        </div>
        <button
          onClick={() =>
            createBounty({
              skill: "development",
              tier: "Entry",
              title: "First bounty",
              description: "Test bounties",
            })
          }
        >
          Create Bounty
        </button>
      </div>
    </div>
  );
};

export default QwComponent;
