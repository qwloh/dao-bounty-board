import { Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { ContributorRecord } from "../model/contributor-record.model";
import { BountyBoardProgramAccount } from "../model/util.model";

export const getContributorRecord = async (
  program: Program<DaoBountyBoard>,
  contributorRecordPK: PublicKey
) => program.account.contributorRecord.fetchNullable(contributorRecordPK);

export const getAllContributorRecordsForRealm = async (
  connection: Connection,
  program: Program<DaoBountyBoard>,
  realmPK: PublicKey
): Promise<string[]> => {
  // filter by realm PK
  const contributorRecords = await connection.getProgramAccounts(
    program.programId,
    {
      dataSlice: { offset: 0, length: 0 },
      filters: [
        { memcmp: program.coder.accounts.memcmp("contributorRecord") },
        { memcmp: { offset: 8 + 1 + 32, bytes: realmPK.toString() } },
      ],
    }
  );
  return contributorRecords.map((b) => b.pubkey.toString());
};

export const getPagedContributorRecords = async (
  program: Program<DaoBountyBoard>,
  contributorRecordPKs: PublicKey[]
): Promise<BountyBoardProgramAccount<ContributorRecord>[]> => {
  const contributorRecords =
    await program.account.contributorRecord.fetchMultiple(contributorRecordPKs);
  //@ts-ignore
  return contributorRecords.map((acc, i) => ({
    pubkey: contributorRecordPKs[i],
    account: acc,
  }));
};
