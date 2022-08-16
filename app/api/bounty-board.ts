import { AnchorProvider, Program } from "@project-serum/anchor";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  DUMMY_MINT_PK,
  GOVERNANCE_PROGRAM_ID,
  INIT_BOUNTY_BOARD_PROPOSAL_NAME,
  PROGRAM_AUTHORITY_SEED,
  UPDATE_BOUNTY_BOARD_PROPOSAL_NAME,
} from "./constants";
import { BountyBoard, BountyBoardConfig } from "../model/bounty-board.model";
import {
  InitialContributorWithRole,
  _createProposal,
  _getInitBountyBoardInstruction,
  _getFundBountyBoardVaultInstruction,
  _getAddContributorWithRoleInstruction,
  _getUpdateBountyBoardInstruction,
  _getAddBountyBoardTierConfigInstruction,
} from "./utils";
import { RealmTreasury, UserRepresentationInDAO } from "../hooks";
import {
  getProposalsByGovernance,
  ProgramAccount,
  Proposal,
  ProposalState,
} from "@solana/spl-governance";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const getBountyBoard = (
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey
) => program.account.bountyBoard.fetchNullable(bountyBoardPubkey);

export const getBountyBoardVaults = async (
  provider: AnchorProvider,
  bountyBoardPubkey: PublicKey
) => {
  const bountyBoardVaults =
    await provider.connection.getParsedTokenAccountsByOwner(
      bountyBoardPubkey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
      // { dataSlice: {offset: 0, length: 0}}
      // ^ not available because @solana/web3.js haven't caught up with JSON rpc method
    );

  console.log(
    "[QW log] Bounty board vaults found",
    bountyBoardVaults.value.length
  );
  // return bountyBoardVaults;

  // parsed it into shape compatible with spl-token
  const normalizedBountyBoardVaults = bountyBoardVaults.value.map((v) => {
    const data = v.account.data.parsed.info;
    return {
      address: v.pubkey,
      mint: data.mint,
      owner: data.owner,
      amount: data.tokenAmount.amount,
      // delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
      // delegatedAmount: rawAccount.delegatedAmount,
      isInitialized: data.state === "initialized",
      // isFrozen: rawAccount.state === AccountState.Frozen,
      isNative: !!data.isNative,
      // rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
      // closeAuthority: rawAccount.closeAuthorityOption
      //   ? rawAccount.closeAuthority
      //   : null,
    };
  });
  return normalizedBountyBoardVaults;
};

export const getActiveBountyBoardProposal = async (
  program: Program<DaoBountyBoard>,
  governancePubkeys: PublicKey[]
) => {
  const provider = program.provider as AnchorProvider;
  // very inefficient, well
  const proposalsForAllGovernances: ProgramAccount<Proposal>[] = [];
  for (const governancePK of governancePubkeys) {
    console.log(
      `[QW log] Get active bounty board proposal for ${governancePK}`
    );
    const proposals = await getProposalsByGovernance(
      provider.connection,
      new PublicKey(GOVERNANCE_PROGRAM_ID),
      governancePK
    );
    proposalsForAllGovernances.push(...proposals);
  }
  console.log(
    `[QW log] Proposals found ${proposalsForAllGovernances.length}`,
    proposalsForAllGovernances
  );

  return proposalsForAllGovernances.filter(
    (p) =>
      p.account.name === INIT_BOUNTY_BOARD_PROPOSAL_NAME &&
      [
        ProposalState.Draft,
        ProposalState.SigningOff,
        ProposalState.Voting,
        ProposalState.Executing,
      ].includes(p.account.state)
  );
};

// bounty board PDA 3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf
// bounty board vault PDA EMZypZAEaHxGhJPbU6HCYYJxYzGnNGPDgmH1GsKcEjBN
// First vault mint ATA ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m
// Council mint governance 63t4tEfLcBwRvhHuTX9BGVT1iHm5dJjez1Bbb5QS9XJF

export const proposeInitBountyBoard = async (
  program: Program<DaoBountyBoard>,
  realmPubkey: PublicKey,
  userRepresentationInDAO: UserRepresentationInDAO,
  bountyBoardPubkey: PublicKey,
  boardConfig: BountyBoardConfig,
  realmTreasury: RealmTreasury,
  amountToFundBountyBoardVault: number,
  initialContributorsWithRole: InitialContributorWithRole[]
) => {
  const provider = program.provider as AnchorProvider; // anchor provider is stored in program obj after being init

  // determine if proposal is to be created on council mint or community mint, and get user's representation acc in DAO
  const {
    governance: realmGovernancePubkey,
    governingTokenMint: governingTokenMintPubkey,
    tokenOwnerRecord,
  } = userRepresentationInDAO;
  const { nativeTreasury } = realmTreasury;
  console.log(
    "Chosen identity",
    `Council token owner record? ${userRepresentationInDAO.council}`,
    `Council related treasury? ${realmTreasury.council}`,
    {
      realmGovernancePubkey: realmGovernancePubkey.toString(),
      governingTokenMintPubkey: governingTokenMintPubkey.toString(),
      tokenOwnerRecordPubkey: tokenOwnerRecord.pubkey.toString(),
      nativeTreasury: nativeTreasury.toString(),
    }
  );

  // create instruction objects
  console.log("Board config", boardConfig);
  const initBountyBoardInstruction: TransactionInstruction =
    await _getInitBountyBoardInstruction(
      program,
      realmPubkey,
      realmGovernancePubkey,
      bountyBoardPubkey,
      new PublicKey(DUMMY_MINT_PK.USDC),
      boardConfig.roles
    );

  const addBountyBoardTiersConfigInstruction: TransactionInstruction =
    await _getAddBountyBoardTierConfigInstruction(
      program,
      bountyBoardPubkey,
      realmGovernancePubkey,
      boardConfig.tiers
    );

  const fundBountyBoardVaultInstruction: TransactionInstruction =
    await _getFundBountyBoardVaultInstruction(
      program,
      bountyBoardPubkey,
      nativeTreasury,
      new PublicKey(DUMMY_MINT_PK.USDC),
      amountToFundBountyBoardVault
    );

  const addContributorWithRoleInstructions: TransactionInstruction[] = [];
  for (const initialContributor of initialContributorsWithRole) {
    const ix = await _getAddContributorWithRoleInstruction(
      program,
      bountyBoardPubkey,
      realmGovernancePubkey,
      initialContributor,
      provider.wallet.publicKey
    );
    addContributorWithRoleInstructions.push(ix);
  }

  // submit proposal
  const proposalAddress = await _createProposal(
    provider,
    realmPubkey,
    realmGovernancePubkey,
    governingTokenMintPubkey,
    tokenOwnerRecord.pubkey,
    INIT_BOUNTY_BOARD_PROPOSAL_NAME,
    "", // or a link to our app to show config
    [
      initBountyBoardInstruction,
      addBountyBoardTiersConfigInstruction,
      fundBountyBoardVaultInstruction,
      ...addContributorWithRoleInstructions,
    ]
  );

  const proposalUrl = `https://app.realms.today/dao/${realmPubkey}/proposal/${proposalAddress}?cluster=devnet`;
  console.log("Proposal url", proposalUrl);

  return proposalUrl; // return url to view proposal
};

// temporarily disabling due to potential complications
// export const proposeUpdateBountyBoardConfig = async (
//   program: Program<DaoBountyBoard>,
//   realmPubkey: PublicKey,
//   userRepresentationInDAO: UserRepresentationInDAO,
//   bountyBoardPubkey: PublicKey,
//   boardConfig: BountyBoardConfig
// ) => {
//   const provider = program.provider as AnchorProvider;
//   // determine if proposal is to be created on council mint or community mint, and get user's representation acc in DAO
//   const {
//     governance: realmGovernancePubkey,
//     governingTokenMint: governingTokenMintPubkey,
//     tokenOwnerRecord,
//   } = userRepresentationInDAO;
//   console.log(
//     "Chosen identity",
//     `Council token owner record? ${userRepresentationInDAO.council}`,
//     {
//       realmGovernancePubkey: realmGovernancePubkey.toString(),
//       governingTokenMintPubkey: governingTokenMintPubkey.toString(),
//       tokenOwnerRecordPubkey: tokenOwnerRecord.pubkey.toString(),
//     }
//   );
//   // create instruction objects
//   console.log("Board config", boardConfig);
//   const updateBountyBoardInstruction: TransactionInstruction =
//     await _getUpdateBountyBoardInstruction(
//       program,
//       realmGovernancePubkey,
//       bountyBoardPubkey,
//       boardConfig
//     );

//   // submit proposal
//   const proposalAddress = await _createProposal(
//     provider,
//     realmPubkey,
//     realmGovernancePubkey,
//     governingTokenMintPubkey,
//     tokenOwnerRecord.pubkey,
//     UPDATE_BOUNTY_BOARD_PROPOSAL_NAME,
//     "", // or a link to our app to show config
//     [updateBountyBoardInstruction]
//   );

//   const proposalUrl = `https://app.realms.today/dao/${realmPubkey}/proposal/${proposalAddress}?cluster=devnet`;
//   console.log("Proposal url", proposalUrl);

//   return proposalUrl; // return url to view proposal
// };

// test script
// getBountyBoard(new PublicKey("8B5wLgaVbGbi1WUmMceyusjVSKP24n8wZRwDNGsUHH1a"));
