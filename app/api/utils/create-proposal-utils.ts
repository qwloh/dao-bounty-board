import { AnchorProvider } from "@project-serum/anchor";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import {
  AccountMetaData,
  getGovernance,
  getSignatoryRecordAddress,
  InstructionData,
  VoteType,
  withAddSignatory,
  withCreateProposal,
  withInsertTransaction,
  withSignOffProposal,
} from "@solana/spl-governance";
import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { sendLargeTx } from "./send-large-tx-utils";

const chunkBy = 2;

export function chunks<T>(array: T[], size: number): T[][] {
  const result: Array<T[]> = [];
  let i, j;
  for (i = 0, j = array.length; i < j; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

export const _createProposal = async (
  provider: AnchorProvider,
  realmPubkey: PublicKey, // DAO public key
  governancePubkey: PublicKey,
  governingTokenMintPubkey: PublicKey,
  tokenOwnerRecordPubkey: PublicKey,
  proposalName: string,
  descriptionLink: string,
  insertInstructions: TransactionInstruction[]
) => {
  const walletPubkey = provider.wallet.publicKey;

  // code copied and simplified from Governance UI
  const governanceProgramId = new PublicKey(
    "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw"
  );

  const governanceAuthority = walletPubkey;
  const signatory = walletPubkey;
  const payer = walletPubkey;

  const programVersion = 2;

  // V2 Approve/Deny configuration
  const voteType = VoteType.SINGLE_CHOICE;
  const options = ["Approve"];
  const useDenyOption = true;

  // prep fields
  const governance = await getGovernance(provider.connection, governancePubkey);
  const proposalIndex = governance.account.proposalCount;

  // the whole operation is made up of several smaller instructions
  // each withXX method takes the below array and push new instruction to it
  const instructions: TransactionInstruction[] = [];

  // Instruction A. createProposal
  const proposalAddress = await withCreateProposal(
    instructions,
    governanceProgramId,
    programVersion,
    realmPubkey,
    governance.pubkey,
    tokenOwnerRecordPubkey,
    proposalName,
    descriptionLink,
    governingTokenMintPubkey,
    governanceAuthority,
    proposalIndex,
    voteType,
    options,
    useDenyOption,
    payer,
    // plugin?.voterWeightPk
    undefined
  );
  console.log("Create proposal instruction added");
  console.log("instructions length", instructions.length);

  // Instruction B. Add proposer as signatory
  await withAddSignatory(
    instructions,
    governanceProgramId,
    programVersion,
    proposalAddress,
    tokenOwnerRecordPubkey,
    governanceAuthority,
    signatory,
    payer
  );
  console.log("Add signatory instruction added");
  console.log("instructions length", instructions.length);

  const signatoryRecordAddress = await getSignatoryRecordAddress(
    governanceProgramId,
    proposalAddress,
    signatory
  );

  // Instruction C. For each insertInstruction (instruction whose execution is to be deferred until proposal is passed),
  // create an account to store them on chain
  for (const [index, instruction] of insertInstructions
    .filter((x) => x.data)
    .entries()) {
    const ixData = new InstructionData({
      data: instruction.data,
      programId: instruction.programId,
      accounts: instruction.keys.map((k) => new AccountMetaData(k)),
    });
    console.log("Instruction data to insert");
    console.log("Program id", ixData.programId.toString());
    console.log("Data", bs58.encode(ixData.data));
    console.log(
      "Accounts: ",
      ixData.accounts.map((acc) => ({ ...acc, pubkey: acc.pubkey.toString() }))
    );

    const proposalTxPk = await withInsertTransaction(
      instructions,
      governanceProgramId,
      programVersion,
      governance.pubkey,
      proposalAddress,
      tokenOwnerRecordPubkey,
      governanceAuthority,
      index,
      0,
      0, // instruction hold up time
      [ixData],
      payer
    );
    console.log("Instruction to create ProposalTransaction added");
    console.log("Instructions length", instructions.length);
    console.log("ProposalTransaction pubkey", proposalTxPk.toString());
  }

  // Instruction D. Make proposer sign off proposal
  withSignOffProposal(
    instructions, // SingOff proposal needs to be executed after inserting instructions hence we add it to insertInstructions
    governanceProgramId,
    programVersion,
    realmPubkey,
    governance.pubkey,
    proposalAddress,
    signatory,
    signatoryRecordAddress,
    undefined
  );
  console.log("Instruction to sign off proposal added");
  console.log("Instructions length", instructions.length);

  // Actual sending of tx (hard code to handle init vs update operation)
  const chunkedIxns =
    instructions.length > 4
      ? [
          [instructions[0], instructions[1]],
          [instructions[2]], // make init ix standalone as it's huge
          [instructions[3]], // make tier config ix standalone as it's huge too
          ...chunks(instructions.slice(4), chunkBy),
        ]
      : [instructions];

  console.log("All instructions", instructions);
  console.log("Chunked", instructions.slice(4));
  try {
    const createProposalTxns = await sendLargeTx(provider, chunkedIxns);
    console.log("Transaction Signature", createProposalTxns);
    console.log("Proposal pubkey", proposalAddress.toString());
    return proposalAddress;
  } catch (err) {
    console.log("Send large tx fail. Error", err);
  }
};

// console.log(`Creating proposal`);
// const transaction = new Transaction();
// console.log("Instructions count", instructions.length);
// for (const i of instructions) {
//   transaction.add(i);
// }

// console.log(
//   "Paper wallet keypair pubkey",
//   paperWalletKeypair.publicKey.toString()
// );

// const createProposalTx = await provider.sendAndConfirm(transaction);

// const createProposalTx = await sendAndConfirmTransaction(
//   provider.connection,
//   transaction,
//   // [paperWalletKeypair]
//   [provider.wallet]
// );
