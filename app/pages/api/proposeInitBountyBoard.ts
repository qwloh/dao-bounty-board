import { AnchorProvider, BN, utils } from "@project-serum/anchor";
import {
  getGovernance,
  getRealm,
  getTokenOwnerRecord,
  getTokenOwnerRecordAddress,
  ProgramAccount,
  Realm,
} from "@solana/spl-governance";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  COMMON_MINT_PK,
  GOVERNANCE_PROGRAM_ID,
  PROGRAM_AUTHORITY_SEED,
} from "../constants";
import { BountyBoardConfig } from "../model/bounty-board.model";
import { _createProposal } from "./create-proposal-utils";
import { _getProposalGovernanceForUser } from "./get-realm-utils";
import bountyBoardProgram from "./initBountyBoardProgram";

const _getInitBountyBoardInstruction = async (
  realmPubkey: PublicKey,
  realmGovernance: PublicKey,
  boardConfig: BountyBoardConfig
) => {
  const bountyBoardProgramId = bountyBoardProgram.programId;
  const provider = bountyBoardProgram.provider as AnchorProvider; // anchor provider is stored in program obj after being init

  // derive Bounty Board address for this DAO
  const [bountyBoardPDA, bump] = await PublicKey.findProgramAddress(
    [
      utils.bytes.utf8.encode(PROGRAM_AUTHORITY_SEED),
      utils.bytes.bs58.decode(realmPubkey.toString()),
    ],
    bountyBoardProgramId
  );
  console.log("Bounty board PDA: ", bountyBoardPDA.toString());

  // generate init bounty board instruction without actually sending it
  // defer sending to after proposal is passed and when it's executed
  const proposerPubkey = provider.wallet.publicKey;
  const ix = await bountyBoardProgram.methods
    .initBountyBoard({
      realmPk: realmPubkey,
      config: boardConfig,
    })
    .accounts({
      // list of all affected accounts
      bountyBoard: bountyBoardPDA,
      realmGovernance,
      user: proposerPubkey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  console.log("Instruction generated", ix);

  return ix;
};

const _getFundBountyBoardVaultInstruction = async () => {};

export const proposeInitBountyBoard = async (
  realmPk: string,
  boardConfig: BountyBoardConfig
) => {
  const provider = bountyBoardProgram.provider as AnchorProvider; // anchor provider is stored in program obj after being init
  const realmPubkey = new PublicKey(realmPk);

  // determine if proposal is to be created on council mint or community mint, and get user's representation acc in DAO
  const {
    governance: realmGovernancePubkey,
    governingTokenMint: governingTokenMintPubkey,
    tokenOwnerRecord: tokenOwnerRecordPubkey,
  } = await _getProposalGovernanceForUser(provider, realmPubkey);
  console.log("Chosen proposal governance", realmGovernancePubkey.toString());
  console.log(
    "Chosen proposal governance governing token mint",
    governingTokenMintPubkey.toString()
  );
  console.log("Token owner record pubkey", tokenOwnerRecordPubkey.toString());

  // create instruction object
  const initBountyBoardInstruction: TransactionInstruction =
    await _getInitBountyBoardInstruction(
      realmPubkey,
      realmGovernancePubkey,
      boardConfig
    );

  // submit proposal
  const proposalAddress = await _createProposal(
    provider,
    realmPubkey,
    realmGovernancePubkey,
    governingTokenMintPubkey,
    tokenOwnerRecordPubkey,
    "Set up a bounty board for our DAO",
    "", // or a link to our app to show config
    [initBountyBoardInstruction]
  );

  const proposalUrl = `https://app.realms.today/dao/${realmPk}/proposal/${proposalAddress}?cluster=devnet`;
  console.log("Proposal url", proposalUrl);

  return proposalUrl; // return url to view proposal
};

export const DEFAULT_BOARD_CONFIG = (
  PAYOUT_MINT: PublicKey
): BountyBoardConfig => ({
  tiers: [
    {
      tierName: "Entry",
      difficultyLevel: "First contribution",
      minRequiredReputation: 0,
      minRequiredSkillsPt: 0,
      reputationReward: 10,
      skillsPtReward: 10,
      payoutReward: 50,
      payoutMint: PAYOUT_MINT,
    },
    {
      tierName: "A",
      difficultyLevel: "Easy",
      minRequiredReputation: 50,
      minRequiredSkillsPt: 50,
      reputationReward: 20,
      skillsPtReward: 20,
      payoutReward: 200,
      payoutMint: PAYOUT_MINT,
    },
    {
      tierName: "AA",
      difficultyLevel: "Moderate",
      minRequiredReputation: 100,
      minRequiredSkillsPt: 100,
      reputationReward: 50,
      skillsPtReward: 50,
      payoutReward: 500,
      payoutMint: PAYOUT_MINT,
    },
    {
      tierName: "S",
      difficultyLevel: "Complex",
      minRequiredReputation: 500,
      minRequiredSkillsPt: 500,
      reputationReward: 100,
      skillsPtReward: 100,
      payoutReward: 2000,
      payoutMint: PAYOUT_MINT,
    },
  ],
  roles: new BN(250),
  functions: new BN(350),
  lastRevised: new BN(new Date().getTime() / 1000),
});

proposeInitBountyBoard(
  "885LdWunq8rh7oUM6kMjeGV56T6wYNMgb9o6P7BiT5yX",
  DEFAULT_BOARD_CONFIG(new PublicKey(COMMON_MINT_PK.USDC))
);
