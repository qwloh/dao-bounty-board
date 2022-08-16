import {
  getGovernanceAccounts,
  getNativeTreasuryAddress,
  getRealm,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
  Governance,
  GovernanceAccountType,
  ProgramAccount,
  pubkeyFilter,
  Realm,
  TokenOwnerRecord,
} from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "react-query";

import { GOVERNANCE_PROGRAM_ID } from "../api/constants";
import { useAnchorContext } from "./useAnchorContext";

export interface UserRepresentationInDAO {
  council: boolean;
  governance: PublicKey;
  governingTokenMint: PublicKey;
  tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>;
}

export interface RealmTreasury {
  council: boolean;
  nativeTreasury: PublicKey;
  governance: PublicKey;
}

export const useRealm = (
  realmPubkey: PublicKey
): {
  realm: ProgramAccount<Realm>;
  userRepresentationInDAO: UserRepresentationInDAO[];
  realmTreasuries: RealmTreasury[];
} => {
  const { provider } = useAnchorContext();
  console.log("[QW log] Provider ", provider, "Realm pubkey", realmPubkey);

  const { data: realm } = useQuery(
    ["realm", realmPubkey + ""],
    () => {
      console.log("[QW log] Get realm fired");
      return getRealm(provider?.connection, realmPubkey);
    },
    {
      enabled: !!provider && !!realmPubkey,
    }
  );
  console.log("[QW log] Realm", realm);
  console.log(
    "[QW log] Enable condition",
    !!provider && !!realmPubkey && !!realm
  );

  const governanceProgramId = new PublicKey(GOVERNANCE_PROGRAM_ID);

  const { data: processedData } = useQuery(
    ["realm", realmPubkey + "", "user_rep_and_realm_treasuries"],
    async () => {
      const userRepresentationInDAO: UserRepresentationInDAO[] = [];
      const realmTreasuries: RealmTreasury[] = [];

      console.log("[QW log] Get user rep fired");
      const councilMintPubkey = realm.account.config.councilMint;
      if (councilMintPubkey) {
        console.log(`[QW log] Realm has council mint ${councilMintPubkey}`);
        // get council mint governance
        const councilMintGovernance = await getGovernanceAccounts(
          provider.connection,
          governanceProgramId,
          Governance,
          [pubkeyFilter(33, councilMintPubkey)!] // governed account to be mint
        );
        console.log(
          "[QW log] Expected council governance account type: MintGovernanceV2. Obtained: ",
          GovernanceAccountType[councilMintGovernance[0].account.accountType]
        );

        // get treasury associated with this governance
        const treasuryPDA_council = await getNativeTreasuryAddress(
          governanceProgramId,
          councilMintGovernance[0].pubkey
        );
        console.log(
          `[QW log] Treasury associated with council mint ${councilMintGovernance[0].pubkey.toString()}: ${treasuryPDA_council.toString()}`
        );
        realmTreasuries.push({
          council: true,
          governance: councilMintGovernance[0].pubkey,
          nativeTreasury: treasuryPDA_council,
        });

        // check if user has TokenOwnerRecord for council mint
        const tokenOwnerRecordPubkey_council = await getTokenOwnerRecordAddress(
          governanceProgramId,
          realmPubkey,
          councilMintPubkey,
          provider.wallet.publicKey
        );
        console.log(
          `[QW log] Derived TokenOwnerRecord address for council mint: ${tokenOwnerRecordPubkey_council.toString()}`
        );

        try {
          const tokenOwnerRecord_council = await getTokenOwnerRecord(
            provider.connection,
            tokenOwnerRecordPubkey_council
          );

          userRepresentationInDAO.push({
            council: true,
            governance: councilMintGovernance[0].pubkey,
            governingTokenMint: councilMintPubkey,
            tokenOwnerRecord: tokenOwnerRecord_council,
          });
        } catch (err) {
          // user does not have TokenOwnerRecord for council mint
          console.log(
            `[QW log] User does not have TokenOwnerRecord for council mint ${councilMintPubkey.toString()}`,
            err
          );
        }
      }

      // try getting community mint token owner record & related treasury
      const communityMintGovernancePubkey = realm.account.authority;
      const communityMintPubkey = realm.account.communityMint;
      if (!communityMintGovernancePubkey || !communityMintPubkey) {
        throw Error(
          "Realm has no community mint or community mint governance."
        );
      }

      // get treasury associated with this governance
      const treasuryPDA_community = await getNativeTreasuryAddress(
        governanceProgramId,
        communityMintGovernancePubkey
      );
      console.log(
        `[QW log] Treasury associated with community mint ${communityMintGovernancePubkey.toString()}: ${treasuryPDA_community.toString()}`
      );
      realmTreasuries.push({
        council: false,
        governance: communityMintGovernancePubkey,
        nativeTreasury: treasuryPDA_community,
      });

      const tokenOwnerRecordPubkey_community = await getTokenOwnerRecordAddress(
        new PublicKey(GOVERNANCE_PROGRAM_ID),
        realmPubkey,
        communityMintPubkey,
        provider.wallet.publicKey
      );
      try {
        const tokenOwnerRecord_community = await getTokenOwnerRecord(
          provider.connection,
          tokenOwnerRecordPubkey_community
        );
        // if above call is successful, TokenOwnerRecord is present for community mint
        userRepresentationInDAO.push({
          council: false,
          governance: communityMintGovernancePubkey,
          governingTokenMint: councilMintPubkey,
          tokenOwnerRecord: tokenOwnerRecord_community,
        });
      } catch (err) {
        console.log(
          `[QW log] Token owner record (Mint: ${communityMintPubkey.toString()}) not found.`,
          err
        );
      }
      console.log("[QW log] Found user reps in DAO", userRepresentationInDAO);
      console.log("[QW log] Found realm treasuries", realmTreasuries);
      return {
        userRepresentationInDAO,
        realmTreasuries,
      };
    },
    {
      enabled: !!provider && !!realmPubkey && !!realm,
    }
  );

  return {
    realm,
    userRepresentationInDAO: processedData?.userRepresentationInDAO, // if this array is empty, user is not a member of DAO
    realmTreasuries: processedData?.realmTreasuries,
  };
};
