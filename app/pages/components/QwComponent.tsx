import { PublicKey } from "@solana/web3.js";
import React from "react";
import {
  DEV_WALLET_1,
  DEV_WALLET_2,
  DEV_WALLET_3,
  TEST_REALM_PK,
} from "../../api/constants";
import { DEFAULT_CONFIG, getRolesInVec } from "../../api/utils";
import { useAnchorContext, useBountyBoard, useRealm } from "../../hooks";
import { useBounty } from "../../hooks/useBounty";
import { useRealmInfo } from "../../hooks/useRealmInfo";
import { useRealmInfos } from "../../hooks/useRealmInfos";

const QwComponent = () => {
  const { wallet } = useAnchorContext();

  const { realmInfos } = useRealmInfos();
  const { realmInfo } = useRealmInfo(realmInfos?.[0]?.programId);

  const { realm, userRepresentationInDAO, realmTreasuries } = useRealm(
    new PublicKey(TEST_REALM_PK)
  );

  const {
    activeBountyBoardProposals, // if there is already any active ones, direct them to voting instead of letting them init new proposal
    bountyBoard,
    bountyBoardVaults,
    proposeInitBountyBoard,
    // proposeUpdateBountyBoard, // disabling this for now due to potential complication
  } = useBountyBoard(new PublicKey(TEST_REALM_PK));

  const { bounties, getBounty, createBounty, deleteBounty } = useBounty(
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
      <div>
        <div>
          <strong>Total realms: {realmInfos?.length}.</strong> Displaying
          metadata for 1-10
        </div>
        <div>{realmInfos && JSON.stringify(realmInfos?.slice(0, 10))}</div>
      </div>
      <div>
        <strong>Realm metadata</strong>
        <div>{JSON.stringify(realmInfo)}</div>
      </div>
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
          <strong>Bounty board Vaults</strong>
        </div>
        <div>{JSON.stringify(bountyBoardVaults)}</div>
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
              // make ourselves core contributor so we are authorized to createBounty
              initialContributorsWithRole: [
                {
                  roleName: "Core",
                  contributorWallet: new PublicKey(DEV_WALLET_2),
                },
                // {
                //   roleName: "Core",
                //   contributorWallet: new PublicKey(DEV_WALLET_1),
                // },
                // {
                //   roleName: "Core",
                //   contributorWallet: new PublicKey(DEV_WALLET_3),
                // },
              ],
            })
          }
        >
          Propose Init Bounty Board
        </button>
      </div>
      {/* <div>
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
      </div> */}
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
      <div>
        <div>
          <strong>Delete Bounty</strong>
        </div>
        <input
          id="delete-bounty"
          type="text"
          placeholder="Pubkey of bounty to delete"
        />
        <button
          onClick={async () => {
            const bountyPubkey = document.querySelector("#delete-bounty").value;
            console.log(
              `Sending request to delete bounty with pubkey ${bountyPubkey}`
            );
            deleteBounty(new PublicKey(bountyPubkey));
          }}
        >
          Delete Bounty
        </button>
      </div>
    </div>
  );
};

export default QwComponent;
