import { PublicKey } from "@solana/web3.js";
import { UserVotingIdentity } from "../api/realm";

export interface RealmInfoAsJSON {
  symbol: string;
  programId: string;
  programVersion?: number;
  realmId: string;
  website?: string;
  // Specifies the realm mainnet name for resource lookups
  // It's required for none mainnet environments when the realm name is different than on mainnet
  displayName?: string;
  // Website keywords
  keywords?: string;
  // twitter:site meta
  twitter?: string;
  // og:image
  ogImage?: string;

  // banner mage
  bannerImage?: string;

  // 3- featured DAOs  ,2- new DAO with active proposals, 1- DAOs with active proposal,
  sortRank?: number;
}

export interface UIRealmsItem {
  pubkey: PublicKey;
  name: string;
  votingProposalCount: number;
  meta: RealmInfoAsJSON;
  bountyBoard?: PublicKey;
  userIdentities: UserVotingIdentity[]; // not empty if user is member of DAO
}

// /// Governance Realm Account
// /// Account PDA seeds" ['governance', name]
// #[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
// pub struct RealmV2 {
//     /// Governance account type
//     pub account_type: GovernanceAccountType,

//     /// Community mint
//     pub community_mint: Pubkey,

//     /// Configuration of the Realm
//     pub config: RealmConfig,

//     /// Reserved space for future versions
//     pub reserved: [u8; 6],

//     /// The number of proposals in voting state in the Realm
//     pub voting_proposal_count: u16,

//     /// Realm authority. The authority must sign transactions which update the realm config
//     /// The authority should be transferred to Realm Governance to make the Realm self governed through proposals
//     pub authority: Option<Pubkey>,

//     /// Governance Realm name
//     pub name: String,

//     /// Reserved space for versions v2 and onwards
//     /// Note: This space won't be available to v1 accounts until runtime supports resizing
//     pub reserved_v2: [u8; 128],
// }

// /// Realm Config defining Realm parameters.
// #[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
// pub struct RealmConfig {
//     /// Indicates whether an external addin program should be used to provide voters weights for the community mint
//     pub use_community_voter_weight_addin: bool,

//     /// Indicates whether an external addin program should be used to provide max voter weight for the community mint
//     pub use_max_community_voter_weight_addin: bool,

//     /// Reserved space for future versions
//     pub reserved: [u8; 6],

//     /// Min number of voter's community weight required to create a governance
//     pub min_community_weight_to_create_governance: u64,

//     /// The source used for community mint max vote weight source
//     pub community_mint_max_vote_weight_source: MintMaxVoteWeightSource,

//     /// Optional council mint
//     pub council_mint: Option<Pubkey>,
// }
