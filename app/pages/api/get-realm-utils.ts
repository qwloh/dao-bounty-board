import { AnchorProvider } from "@project-serum/anchor";
import {
  getGovernanceAccounts,
  getRealm,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
  Governance,
  GovernanceAccountType,
  pubkeyFilter,
} from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import { GOVERNANCE_PROGRAM_ID } from "../constants";

export const _getProposalGovernanceForUser = async (
  provider: AnchorProvider,
  realmPubkey: PublicKey
): Promise<{
  governance: PublicKey;
  governingTokenMint: PublicKey;
  tokenOwnerRecord: PublicKey;
}> => {
  const governanceProgramId = new PublicKey(GOVERNANCE_PROGRAM_ID);
  const realm = await getRealm(provider.connection, realmPubkey);

  // first determine if DAO has council mint
  const councilMintPubkey = realm.account.config.councilMint;
  if (councilMintPubkey) {
    console.log(`Realm has council mint ${councilMintPubkey}`);
    // if yes, check if user has TokenOwnerRecord for council mint
    const tokenOwnerRecordPubkey_council = await getTokenOwnerRecordAddress(
      governanceProgramId,
      realmPubkey,
      councilMintPubkey,
      provider.wallet.publicKey
    );
    console.log(
      `Derived TokenOwnerRecord address for council mint: ${tokenOwnerRecordPubkey_council.toString()}`
    );

    try {
      const tokenOwnerRecord_council = await getTokenOwnerRecord(
        provider.connection,
        tokenOwnerRecordPubkey_council
      );
      const councilMintGovernance = await getGovernanceAccounts(
        provider.connection,
        governanceProgramId,
        Governance,
        [pubkeyFilter(33, councilMintPubkey)!] // governed account to be mint
      );
      console.log(
        "Expected council governance account type: MintGovernanceV2. Obtained: ",
        GovernanceAccountType[councilMintGovernance[0].account.accountType]
      );
      return {
        governance: councilMintGovernance[0].pubkey,
        governingTokenMint: councilMintPubkey,
        tokenOwnerRecord: tokenOwnerRecordPubkey_council,
      };
    } catch (err) {
      // user does not have TokenOwnerRecord for council mint
      console.log(
        `User does not have TokenOwnerRecord for council mint ${councilMintPubkey.toString()}`,
        err
      );
    }
  }
  // DAO has no council mint, or user has no TokenOwnerRecord for council mint
  // check if user has TokenOwnerRecord for community mint
  const communityGovernancePubkey = realm.account.authority;
  const communityMintPubkey = realm.account.communityMint;
  if (!communityGovernancePubkey || !communityMintPubkey) {
    throw Error("Realm has no community mint or community mint governance.");
  }

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
    return {
      governance: communityGovernancePubkey,
      governingTokenMint: communityMintPubkey,
      tokenOwnerRecord: tokenOwnerRecordPubkey_community,
    };
  } catch (err) {
    console.log(
      `Token owner record (Mint: ${communityMintPubkey.toString()}) not found.`,
      err
    );
    throw Error("Not member of realm.");
  }
};
