import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-governance";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAccount,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { DUMMY_MINT_PK } from "../../app/api/constants";
import { BountyTier, RoleSetting } from "../../app/model/bounty-board.model";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { readableTokenAcc } from "../utils/common";
import {
  getBountyBoardAddress,
  getBountyBoardVaultAddress,
} from "../utils/get_addresses";

export enum Permission {
  CreateBounty = "createBounty",
  UpdateBounty = "updateBounty",
  DeleteBounty = "deleteBounty",
  AssignBounty = "assignBounty",
  RequestChangeToSubmission = "requestChangeToSubmission",
  AcceptSubmission = "acceptSubmission",
  RejectSubmission = "rejectSubmission",
}

export const getTiersInVec = (PAYOUT_MINT: PublicKey) => [
  {
    tierName: "Entry",
    difficultyLevel: "First contribution",
    minRequiredReputation: 0,
    minRequiredSkillsPt: new BN(0),
    reputationReward: 10,
    skillsPtReward: new BN(10),
    payoutReward: new BN(50),
    payoutMint: PAYOUT_MINT,
    taskSubmissionWindow: 7 * 24 * 3600, // 7 days
    submissionReviewWindow: 3 * 24 * 3600, // 3 days
    addressChangeReqWindow: 3 * 24 * 3600, // 3 days
  },
  {
    tierName: "A",
    difficultyLevel: "Easy",
    minRequiredReputation: 50,
    minRequiredSkillsPt: new BN(50),
    reputationReward: 20,
    skillsPtReward: new BN(20),
    payoutReward: new BN(200),
    payoutMint: PAYOUT_MINT,
    taskSubmissionWindow: 14 * 24 * 3600, // 14 days
    submissionReviewWindow: 7 * 24 * 3600, // 7 days
    addressChangeReqWindow: 7 * 24 * 3600, // 7 days
  },
  {
    tierName: "AA",
    difficultyLevel: "Moderate",
    minRequiredReputation: 100,
    minRequiredSkillsPt: new BN(100),
    reputationReward: 50,
    skillsPtReward: new BN(50),
    payoutReward: new BN(500),
    payoutMint: PAYOUT_MINT,
    taskSubmissionWindow: 30 * 24 * 3600, // 30 days
    submissionReviewWindow: 7 * 24 * 3600, // 7 days
    addressChangeReqWindow: 7 * 24 * 3600, // 7 days
  },
  {
    tierName: "S",
    difficultyLevel: "Complex",
    minRequiredReputation: 500,
    minRequiredSkillsPt: new BN(500),
    reputationReward: 100,
    skillsPtReward: new BN(100),
    payoutReward: new BN(2000),
    payoutMint: PAYOUT_MINT,
    taskSubmissionWindow: 60 * 24 * 3600, // 60 days
    submissionReviewWindow: 14 * 24 * 3600, // 14 days
    addressChangeReqWindow: 14 * 24 * 3600, // 14 days
  },
];

export const DEFAULT_TIERS: BountyTier[] = getTiersInVec(
  new PublicKey(DUMMY_MINT_PK.USDC)
);

export const getRolesInVec = () => [
  {
    roleName: "Core",
    permissions: Object.values(Permission).map((p) => ({ [p]: {} })),
    default: false,
  },
  { roleName: "Contributor", permissions: [], default: true },
];

export const DEFAULT_ROLES: RoleSetting[] = getRolesInVec();

export interface BountyBoardConfig {
  roles: RoleSetting[];
  tiers: BountyTier[];
  lastRevised: BN;
}

export const setupBountyBoard = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  realmPubkey: PublicKey,
  roles: RoleSetting[] = DEFAULT_ROLES
) => {
  console.log("Bounty board roles", roles);
  const TEST_REALM_PK = realmPubkey;
  const TEST_REALM_GOVERNANCE = Keypair.fromSeed(TEST_REALM_PK.toBytes());
  const TEST_REALM_GOVERNANCE_PK = TEST_REALM_GOVERNANCE.publicKey;
  console.log(
    "Test realm governance public key",
    TEST_REALM_GOVERNANCE_PK.toString()
  );

  const [TEST_BOUNTY_BOARD_PDA] = await getBountyBoardAddress(TEST_REALM_PK);
  console.log("Bounty board PDA", TEST_BOUNTY_BOARD_PDA.toString());

  const TEST_MINT_PK = new PublicKey(DUMMY_MINT_PK.USDC);
  const TEST_BOUNTY_BOARD_VAULT_PDA = await getBountyBoardVaultAddress(
    TEST_BOUNTY_BOARD_PDA,
    TEST_MINT_PK
  );
  console.log("Bounty board vault PDA", TEST_BOUNTY_BOARD_VAULT_PDA.toString());

  try {
    const initBountyBaordTx = await program.methods
      //@ts-ignore
      .initBountyBoard({
        realmPk: TEST_REALM_PK,
        roles,
      })
      .accounts({
        bountyBoard: TEST_BOUNTY_BOARD_PDA,
        realmGovernance: TEST_REALM_GOVERNANCE_PK,
        bountyBoardVault: TEST_BOUNTY_BOARD_VAULT_PDA,
        firstVaultMint: TEST_MINT_PK,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .signers([TEST_REALM_GOVERNANCE])
      // .instruction();
      .rpc();
    console.log("Your transaction signature", initBountyBaordTx);
    console.log("Bounty board init successfully.");
  } catch (err) {
    console.log("[InitBountyBoard] Transaction / Simulation fail.", err);
  }

  let bountyBoardAcc;
  let bountyBoardVaultAcc;
  console.log("--- Bounty Board Acc ---");
  try {
    bountyBoardAcc = await program.account.bountyBoard.fetch(
      TEST_BOUNTY_BOARD_PDA
    );
    console.log("Found", JSON.parse(JSON.stringify(bountyBoardAcc)));
  } catch (err) {
    console.log("Not found. Error", err.message);
  }

  console.log("--- Bounty Board Vault Acc ---");
  try {
    bountyBoardVaultAcc = await getAccount(
      provider.connection,
      TEST_BOUNTY_BOARD_VAULT_PDA,
      "recent",
      TOKEN_PROGRAM_ID
    );
    console.log("Found", readableTokenAcc(bountyBoardVaultAcc));
  } catch (err) {
    console.log(
      "Not found. Error",
      err.name,
      "for",
      TEST_BOUNTY_BOARD_VAULT_PDA.toString(),
      err
    );
  }

  return {
    realmGovernancePk: TEST_REALM_GOVERNANCE_PK,
    bountyBoardPDA: TEST_BOUNTY_BOARD_PDA,
    bountyBoardAcc,
    bountyBoardVaultPDA: TEST_BOUNTY_BOARD_VAULT_PDA,
    bountyBoardVaultAcc,
  };
};

export const addBountyBoardTierConfig = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey,
  realmGovernance: Keypair,
  tiers: BountyTier[] = DEFAULT_TIERS
) => {
  // console.log("Tiers to add", tiers);
  const TEST_BOUNTY_BOARD_PK = bountyBoardPubkey;
  const TEST_REALM_GOVERNANCE = realmGovernance;

  try {
    const addTierConfigTx = await program.methods
      //@ts-ignore
      .addBountyBoardTierConfig({
        tiers,
      })
      .accounts({
        bountyBoard: TEST_BOUNTY_BOARD_PK,
        realmGovernance: TEST_REALM_GOVERNANCE.publicKey,
      })
      .signers([TEST_REALM_GOVERNANCE])
      // .instruction();
      .rpc();
    console.log("Your transaction signature", addTierConfigTx);
    console.log("Tiers config added successfully.");
  } catch (err) {
    console.log(
      "[AddBountyBoardTiersConfig] Transaction / Simulation fail.",
      err
    );
    throw err;
  }

  const updatedBountyBoardAcc = await program.account.bountyBoard.fetch(
    TEST_BOUNTY_BOARD_PK
  );
  const tierConfig = updatedBountyBoardAcc.config.tiers as BountyTier[];
  console.log("Updated tiers count", tierConfig.length);
  return { updatedBountyBoardAcc };
};

export const seedBountyBoardVault = async (
  provider: AnchorProvider,
  bountyBoardVaultPubkey: PublicKey,
  fundingAddress: PublicKey,
  fundingAddressOwner: PublicKey
  // signer: PublicKey,
) => {
  const ix = createTransferInstruction(
    fundingAddress,
    bountyBoardVaultPubkey,
    fundingAddressOwner,
    100 * Math.pow(10, 6)
  );

  const unsignedTx = new Transaction().add(ix);
  await provider.sendAndConfirm(unsignedTx);

  // check bounty board vault is properly seeded
  const bountyBoardVaultAcc = await getAccount(
    provider.connection,
    bountyBoardVaultPubkey
  );
  console.log("New amount in bounty board vault", bountyBoardVaultAcc.amount);
};

export const cleanUpBountyBoard = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  bountyBoardPDA: PublicKey,
  bountyBoardVaultPDA: PublicKey,
  realmTreasuryAta: PublicKey
) => {
  // close bounty board vault account first
  try {
    await program.methods
      .closeBountyBoardVault()
      .accounts({
        bountyBoard: bountyBoardPDA,
        bountyBoardVault: bountyBoardVaultPDA,
        // FFeqLD5am9P3kPJAdXDUcymJirvkAe6GvbkZcva1RtRj
        // GZywBMtMyZTR5MnFJsnBkDrJHPWovHoc2P6sENFEzyZy
        realmTreasuryAta,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log(
      `Bounty board vault acc ${bountyBoardVaultPDA.toString()} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty board vault acc ${bountyBoardVaultPDA.toString()}`,
      err.message
    );
    return; // don't clear bounty board account if bounty board vault account is not successfully cleared
  }

  // close bounty board account
  try {
    await program.methods
      .closeBountyBoard()
      .accounts({
        bountyBoard: bountyBoardPDA,
        // 2FzQVjh1SMCr2dbdCpw5PwxvQVp5ugFoeJpmfdHgqsw8
        // 5b9FGEPHJqGoPa9XvdBsdD83gXYEKmJb6zWUsxxBigHj
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Bounty board acc ${bountyBoardPDA.toString()} closed`);
  } catch (err) {
    console.log(
      `Error clearing bounty board acc ${bountyBoardPDA.toString()}`,
      err.message
    );
  }
};
