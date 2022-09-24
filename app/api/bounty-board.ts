import {
  AnchorProvider,
  BorshInstructionCoder,
  Program,
} from "@project-serum/anchor";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  DUMMY_MINT_PK,
  GOVERNANCE_PROGRAM_ID,
  INIT_BOUNTY_BOARD_PROPOSAL_NAME,
  UPDATE_BOUNTY_BOARD_PROPOSAL_NAME,
} from "./constants";
import { BountyBoardConfig, Permission } from "../model/bounty-board.model";
import {
  InitialContributorWithRole,
  _createProposal,
  _getInitBountyBoardInstruction,
  _getFundBountyBoardVaultInstruction,
  _getAddContributorWithRoleInstruction,
  _getUpdateBountyBoardInstruction,
  _getAddBountyBoardTierConfigInstruction,
  getBountyBoardAddress,
} from "./utils";
import {
  getGovernanceAccounts,
  getProposalsByGovernance,
  InstructionData,
  ProgramAccount,
  Proposal,
  ProposalState,
  ProposalTransaction,
  pubkeyFilter,
} from "@solana/spl-governance";
import { DaoBountyBoard } from "../../target/types/dao_bounty_board";
import {
  DecodedTransferInstruction,
  decodeInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  unpackAccount,
} from "@solana/spl-token";
import { UserProposalEntity } from "../hooks/realm/useUserProposalEntitiesInRealm";
import { _getInitBountyBoardDescription } from "./utils/proposal-description-utils";
import { BountyBoardProgramAccount } from "../model/util.model";
import { bytesToAddressStr, bytesToStr } from "../utils/encoding";

export const getAllBountyBoards = async (
  connection: Connection,
  program: Program<DaoBountyBoard>
): Promise<BountyBoardProgramAccount<{ realm: string }>[]> => {
  // get all bounty boards in the world
  const bountyBoards = await connection.getProgramAccounts(program.programId, {
    dataSlice: { offset: 8, length: 32 }, // keep the realm PK
    filters: [{ memcmp: program.coder.accounts.memcmp("bountyBoard") }],
  });
  // Example data buffer: [0,0,0,0,0,0,0,0, 0, 69,110,116,114,121,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0]
  return bountyBoards.map((b) => ({
    pubkey: b.pubkey,
    account: {
      realm: bytesToAddressStr(b.account.data),
    },
  }));
};

export const getBountyBoard = async (
  program: Program<DaoBountyBoard>,
  bountyBoardPubkey: PublicKey
) => {
  const bountyBoardAcc = await program.account.bountyBoard.fetchNullable(
    bountyBoardPubkey
  );

  return {
    pubkey: bountyBoardPubkey,
    account: bountyBoardAcc
      ? {
          ...bountyBoardAcc,
          config: {
            ...bountyBoardAcc.config,
            //@ts-ignore
            tiers: bountyBoardAcc.config.tiers.map((t) => ({
              ...t,
              tierName: bytesToStr(t.tierName),
            })),
            //@ts-ignore
            roles: bountyBoardAcc.config.roles.map((r) => ({
              ...r,
              roleName: bytesToStr(r.roleName),
            })),
          },
        }
      : null,
  };
};

export const getBountyBoardVaults = async (
  connection: Connection,
  bountyBoardPubkey: PublicKey
) => {
  const bountyBoardVaults = await connection.getTokenAccountsByOwner(
    bountyBoardPubkey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
    // { dataSlice: {offset: 0, length: 0}}
    // ^ not available because @solana/web3.js haven't caught up with JSON rpc method
  );

  return bountyBoardVaults.value.map((v) =>
    unpackAccount(v.pubkey, v.account, TOKEN_PROGRAM_ID)
  );
};

const decodeSplTokenTransferIx = (
  ix: InstructionData
): DecodedTransferInstruction => {
  return decodeInstruction({
    programId: ix.programId,
    data: Buffer.from(ix.data),
    keys: ix.accounts,
  }) as unknown as DecodedTransferInstruction;
};

const transformPermissions = (
  permissions: Record<keyof typeof Permission, {}>[]
): (keyof typeof Permission)[] =>
  permissions.map(
    (p) => Permission[Permission[Object.keys(p)[0]]] as keyof typeof Permission
  );

type proposedBoardConfig = Omit<BountyBoardConfig, "lastRevised"> & {
  initialContributors: InitialContributorWithRole[];
  amountToFundBountyBoardVault: number;
  firstVaultMint: PublicKey;
};

const attachProposedConfig = async (
  program: Program<DaoBountyBoard>,
  proposal: ProgramAccount<Proposal>
) => {
  const proposalAddress = proposal.pubkey;

  const proposalTransactions = await getGovernanceAccounts(
    program.provider.connection,
    new PublicKey(GOVERNANCE_PROGRAM_ID),
    ProposalTransaction,
    [pubkeyFilter(1, proposalAddress)!]
  );

  const boardConfig = {
    initialContributors: [],
  } as proposedBoardConfig;

  const ixDecoder = new BorshInstructionCoder(program.idl);
  for (const tx of proposalTransactions) {
    console.log(tx.account.instructions);
    const txBuffer = Buffer.from(tx.account.instructions[0].data);
    const decodedTx = ixDecoder.decode(txBuffer);

    switch (decodedTx?.name) {
      case "initBountyBoard":
        //@ts-ignore
        boardConfig.roles = decodedTx.data.data.roles.map((r) => ({
          ...r,
          permissions: transformPermissions(r.permissions),
        }));
        break;
      case "addBountyBoardTierConfig":
        //@ts-ignore
        boardConfig.tiers = decodedTx.data.data.tiers;
        break;
      case "addContributorWithRole":
        //@ts-ignore
        boardConfig.initialContributors.push(decodedTx.data.data);
        break;
      default:
        try {
          const decodedTransferIx = decodeSplTokenTransferIx(
            tx.account.instructions[0]
          );
          boardConfig.amountToFundBountyBoardVault = new Number(
            decodedTransferIx.data.amount
          ).valueOf();

          const ata = await getAccount(
            program.provider.connection,
            decodedTransferIx.keys.source.pubkey
          );
          boardConfig.firstVaultMint = ata.mint;

          break;
        } catch (e) {
          console.error(e);
        }
        console.warn(`Unknown instruction ${decodedTx?.name}`);
    }
  }

  return {
    ...proposal,
    account: {
      ...proposal.account,
      boardConfig,
    },
  };
};

export const getActiveBountyBoardProposal = async (
  program: Program<DaoBountyBoard>,
  governancePubkeys: PublicKey[]
) => {
  const provider = program.provider as AnchorProvider;
  // very inefficient, well
  const proposalsForAllGovernances: ProgramAccount<Proposal>[] = [];
  for (const governancePK of governancePubkeys) {
    const proposals = await getProposalsByGovernance(
      provider.connection,
      new PublicKey(GOVERNANCE_PROGRAM_ID),
      governancePK
    );
    proposalsForAllGovernances.push(...proposals);
  }

  const activeProposals = proposalsForAllGovernances.filter(
    (p) =>
      p.account.name === INIT_BOUNTY_BOARD_PROPOSAL_NAME &&
      [
        ProposalState.Draft,
        ProposalState.SigningOff,
        ProposalState.Voting,
        ProposalState.Succeeded,
        ProposalState.Executing,
      ].includes(p.account.state)
  );

  return Promise.all(
    Array.from(activeProposals, (p) => attachProposedConfig(program, p))
  );
};

// bounty board PDA 3q3na9snfaaVi5e4qNNFRzQiXyRF6RiFQ15aSPBWxtKf
// bounty board vault PDA EMZypZAEaHxGhJPbU6HCYYJxYzGnNGPDgmH1GsKcEjBN
// First vault mint ATA ApSd7STwzfVVopcMGVAHfHAAJ89g1y1RouCWphTwWN1m
// Council mint governance 63t4tEfLcBwRvhHuTX9BGVT1iHm5dJjez1Bbb5QS9XJF

export const proposeInitBountyBoard = async (
  program: Program<DaoBountyBoard>,
  realmPubkey: PublicKey,
  userProposalEntity: UserProposalEntity,
  boardConfig: Omit<BountyBoardConfig, "lastRevised">,
  firstVaultMint: PublicKey,
  amountToFundBountyBoardVault: number,
  initialContributorsWithRole: InitialContributorWithRole[]
) => {
  const provider = program.provider as AnchorProvider; // anchor provider is stored in program obj after being init

  if (!userProposalEntity)
    throw new Error("Please provide voting identity to use in DAO");

  // determine if proposal is to be created on council mint or community mint, and get user's representation acc in DAO
  const {
    council,
    governance: realmGovernancePubkey,
    governingTokenMint: governingTokenMintPubkey,
    tokenOwnerRecord,
    nativeTreasury,
  } = userProposalEntity;

  console.log("Chosen identity", `Council token owner record? ${council}`, {
    realmGovernancePubkey: realmGovernancePubkey.toString(),
    governingTokenMintPubkey: governingTokenMintPubkey.toString(),
    tokenOwnerRecordPubkey: tokenOwnerRecord.toString(),
    nativeTreasury: nativeTreasury.toString(),
  });

  // compute bounty board PDA
  const [bountyBoardPubkey] = await getBountyBoardAddress(realmPubkey);

  // create instruction objects
  console.log("Board config", boardConfig);
  const initBountyBoardInstruction: TransactionInstruction =
    await _getInitBountyBoardInstruction(
      program,
      realmPubkey,
      realmGovernancePubkey,
      bountyBoardPubkey,
      firstVaultMint,
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

  // const proposalDescription = _getInitBountyBoardDescription(boardConfig);

  // submit proposal
  const proposalAddress = await _createProposal(
    provider,
    realmPubkey,
    realmGovernancePubkey,
    governingTokenMintPubkey,
    tokenOwnerRecord,
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
