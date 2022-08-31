import {
  getGovernanceAccounts,
  getNativeTreasuryAddress,
  getTokenOwnerRecordsByOwner,
  Governance,
  ProgramAccount,
  pubkeyFilter,
  Realm,
  TokenOwnerRecord,
} from "@solana/spl-governance";
import { Connection, PublicKey } from "@solana/web3.js";
import { GOVERNANCE_PROGRAM_ID } from "./constants";

export interface UserRealm {
  tokenOwnerRecord: PublicKey;
  governingTokenMint: PublicKey;
  governingTokenOwner: PublicKey;
}

export type UserRealms = Record<
  string, // realm pk
  UserRealm[]
>;

export const getUserRealms = async (
  connection: Connection,
  walletPubkey: PublicKey
): Promise<UserRealms> => {
  const userRealms = {} as UserRealms;

  let res: ProgramAccount<TokenOwnerRecord>[];
  try {
    res = await getTokenOwnerRecordsByOwner(
      connection,
      new PublicKey(GOVERNANCE_PROGRAM_ID),
      walletPubkey
    );
  } catch (err) {
    console.error("Error getting user realms", err);
    return userRealms;
  }

  for (const tokenOwnerRecord of res) {
    const realmPkStr = tokenOwnerRecord.account.realm.toString();
    if (!userRealms[realmPkStr]) {
      userRealms[realmPkStr] = [];
    }
    userRealms[realmPkStr].push({
      tokenOwnerRecord: tokenOwnerRecord.pubkey,
      governingTokenMint: tokenOwnerRecord.account.governingTokenMint,
      governingTokenOwner: tokenOwnerRecord.account.governingTokenOwner, // should be same as wallet pk
    });
  }
  console.log("User realms", userRealms);
  return userRealms;
};

// uncomment and run `ts-node api/realm.ts` to test
// getUserRealms(
//   new Connection(clusterApiUrl("devnet"), "processed"),
//   new PublicKey("CxhnAJoZYEhgQzyCfpfEmmuCaLHzBVr2bQSNmQDWDhrj")
// );

const governanceProgramId = new PublicKey(GOVERNANCE_PROGRAM_ID);

export interface RealmProposalEntity {
  realm: PublicKey;
  council: boolean;
  governingTokenMint: PublicKey; // voting token, can be council token or community token
  governance: PublicKey; // governance account that has the minting right over the voting token
  nativeTreasury: PublicKey; // treasury that holds the voting token
}

export const getRealmProposalEntities = async (
  connection: Connection,
  realmAccount: ProgramAccount<Realm>
) => {
  const { account, pubkey } = realmAccount;

  let entities: RealmProposalEntity[] = [];

  // get accounts related to voting with community token
  const communityMintGovernance = account.authority;
  const communityMint = account.communityMint;
  if (!communityMintGovernance || !communityMint) {
    throw Error("Realm has no community mint or community mint governance.");
  }
  const communityMintTreasury = await getNativeTreasuryAddress(
    governanceProgramId,
    communityMintGovernance
  );
  entities.push({
    realm: pubkey,
    council: false,
    governingTokenMint: communityMint,
    governance: communityMintGovernance,
    nativeTreasury: communityMintTreasury,
  });

  // get accounts related to voting with council token. note some DAO may not have council token
  const councilMint = account.config.councilMint;
  if (!councilMint) return entities;

  const councilMintGovernance = await getGovernanceAccounts(
    connection,
    governanceProgramId,
    Governance,
    [pubkeyFilter(33, councilMint)!] // governed account to be mint
  );
  const councilMintTreasury = await getNativeTreasuryAddress(
    governanceProgramId,
    councilMintGovernance[0].pubkey
  );

  entities.push({
    realm: pubkey,
    council: true,
    governingTokenMint: councilMint,
    governance: councilMintGovernance[0].pubkey,
    nativeTreasury: councilMintTreasury,
  });

  return entities;
};
