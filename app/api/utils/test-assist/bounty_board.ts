import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-governance";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { DaoBountyBoard } from "../../../../target/types/dao_bounty_board";
import {
  BountyBoardConfig,
  RoleSetting,
} from "../../../model/bounty-board.model";
import { DUMMY_MINT_PK } from "../../constants";
import {
  getBountyBoardAddress,
  getBountyBoardVaultAddress,
} from "../pda-utils";
import { readableTokenAcc } from "./common";

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
    minRequiredReputation: new BN(0),
    minRequiredSkillsPt: new BN(0),
    reputationReward: new BN(10),
    skillsPtReward: new BN(10),
    payoutReward: new BN(50),
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "A",
    difficultyLevel: "Easy",
    minRequiredReputation: new BN(50),
    minRequiredSkillsPt: new BN(50),
    reputationReward: new BN(20),
    skillsPtReward: new BN(20),
    payoutReward: new BN(200),
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "AA",
    difficultyLevel: "Moderate",
    minRequiredReputation: new BN(100),
    minRequiredSkillsPt: new BN(100),
    reputationReward: new BN(50),
    skillsPtReward: new BN(50),
    payoutReward: new BN(500),
    payoutMint: PAYOUT_MINT,
  },
  {
    tierName: "S",
    difficultyLevel: "Complex",
    minRequiredReputation: new BN(500),
    minRequiredSkillsPt: new BN(500),
    reputationReward: new BN(100),
    skillsPtReward: new BN(100),
    payoutReward: new BN(2000),
    payoutMint: PAYOUT_MINT,
  },
];

export const getRolesInVec = () => [
  {
    roleName: "Core",
    permissions: Object.values(Permission).map((p) => ({ [p]: {} })),
    default: false,
  },
  { roleName: "Contributor", permissions: [], default: true },
];

export const DEFAULT_CONFIG: BountyBoardConfig = {
  lastRevised: new BN(new Date().getTime() / 1000),
  tiers: getTiersInVec(new PublicKey(DUMMY_MINT_PK.USDC)),
  roles: getRolesInVec(),
};

export const setupBountyBoard = async (
  provider: AnchorProvider,
  program: Program<DaoBountyBoard>,
  realmPubkey: PublicKey,
  config: BountyBoardConfig = DEFAULT_CONFIG
) => {
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
        config,
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
    // .simulate();
    console.log(
      `Bounty board vault acc ${bountyBoardVaultPDA.toString()} closed`
    );
  } catch (err) {
    console.log(
      `Error clearing bounty board vault acc ${bountyBoardVaultPDA.toString()}`,
      err.message,
      err
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
