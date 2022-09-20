import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  BountyApplication,
  BountyApplicationStatus,
} from "../model/bounty-application.model";
import { Bounty } from "../model/bounty.model";
import { BountyBoardProgramAccount } from "../model/util.model";
import {
  getBountyActivityAddress,
  getBountyApplicationAddress,
  getContributorRecordAddress,
} from "./utils";

export const getBountyApplications = async (
  program: Program<DaoBountyBoard>,
  bountyPK: PublicKey
): Promise<BountyBoardProgramAccount<BountyApplication>[]> => {
  const anchorProgAccounts = await program.account.bountyApplication.all([
    {
      memcmp: {
        offset: 8, // after anchor's account discriminator
        bytes: bountyPK.toString(),
      },
    },
  ]);

  // @ts-ignore, return type is hard asserted
  return anchorProgAccounts.map((acc) => ({
    pubkey: acc.publicKey,
    account: {
      ...acc.account,
      // convert rust enums into more convenient form
      // original: status: {assigned: {}}
      // after conversion: state: 'assigned'
      status:
        BountyApplicationStatus[
          BountyApplicationStatus[Object.keys(acc.account.status)[0]]
        ],
    },
  }));
};

interface ApplyToBountyArgs {
  provider: AnchorProvider;
  program: Program<DaoBountyBoard>;
  bountyBoardPK: PublicKey;
  bounty: { pubkey: PublicKey; account: Bounty };
  applicantContributorRecordPK?: PublicKey;
  validity: number;
}

export const applyToBounty = async ({
  provider,
  program,
  bountyBoardPK,
  bounty,
  applicantContributorRecordPK,
  validity,
}: ApplyToBountyArgs) => {
  console.log(`--- Apply to Bounty ---`);
  console.log("bountyBoardPK", bountyBoardPK.toString());
  console.log("bounty", bounty);
  console.log("applicantContributorRecordPK", applicantContributorRecordPK);

  const validityBN = new BN(validity);
  const applicant = provider.wallet.publicKey;

  // contributor record PDA
  let contributorRecordPK = applicantContributorRecordPK;
  if (!applicantContributorRecordPK) {
    const [contributorRecordPDA] = await getContributorRecordAddress(
      bountyBoardPK,
      applicant
    );
    contributorRecordPK = contributorRecordPDA;
  }
  console.log(`Contributor record PDA ${contributorRecordPK}`);

  // bounty application PDA
  const [bountyApplicationPDA] = await getBountyApplicationAddress(
    bounty.pubkey,
    contributorRecordPK
  );
  console.log(`Bounty Application PDA ${bountyApplicationPDA}`);

  // bounty activity PDA
  console.log(`Current bounty activityIndex ${bounty.account.activityIndex}`);
  const [bountyActivityPDA] = await getBountyActivityAddress(
    bounty.pubkey,
    bounty.account.activityIndex
  );
  console.log(`Bounty Activity (Apply) PDA ${bountyActivityPDA}`);

  return program.methods
    .applyToBounty({
      validity: validityBN,
    })
    .accounts({
      bountyBoard: bountyBoardPK,
      bounty: bounty.pubkey,
      bountyApplication: bountyApplicationPDA,
      bountyActivity: bountyActivityPDA,
      contributorRecord: contributorRecordPK,
      applicant,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .rpc();
};
