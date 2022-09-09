import { BN, Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { ContributorRecord } from "../model/contributor-record.model";
import { BountyBoardProgramAccount } from "../model/util.model";
import { mapBytesToStr } from "./utils/mapping-utils";

export const getContributorRecord = async (
  program: Program<DaoBountyBoard>,
  contributorRecordPK: PublicKey
) => {
  const contributorRecord =
    await program.account.contributorRecord.fetchNullable(contributorRecordPK);
  return contributorRecord
    ? {
        ...contributorRecord,
        role: mapBytesToStr(contributorRecord.role),
      }
    : null;
};

export const getAllContributorRecordsForRealm = async (
  connection: Connection,
  program: Program<DaoBountyBoard>,
  realmPK: PublicKey
) => {
  // filter by realm PK
  const contributorRecords = await connection.getProgramAccounts(
    program.programId,
    {
      dataSlice: { offset: 8 + 32, length: 32 },
      filters: [
        { memcmp: program.coder.accounts.memcmp("contributorRecord") },
        { memcmp: { offset: 8, bytes: realmPK.toString() } },
      ],
    }
  );
  // Example data buffer [67,111,114,101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  return contributorRecords.map((c) => ({
    pubkey: c.pubkey.toString(),
    account: {
      role: mapBytesToStr(c.account.data.subarray(0, 24)),
      reputation: new BN(c.account.data.subarray(24), "le"),
    },
  }));
};

export const getPagedContributorRecords = async (
  program: Program<DaoBountyBoard>,
  contributorRecordPKs: PublicKey[]
): Promise<BountyBoardProgramAccount<ContributorRecord>[]> => {
  const contributorRecords =
    await program.account.contributorRecord.fetchMultiple(contributorRecordPKs);
  // @ts-ignore, return type is hard asserted
  return contributorRecords.map((acc, i) => ({
    pubkey: contributorRecordPKs[i],
    account: acc
      ? {
          ...acc,
          // @ts-ignore
          role: mapBytesToStr(acc.role),
        }
      : null,
  }));
};
