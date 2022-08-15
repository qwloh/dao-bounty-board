import { ProgramAccount, Realm } from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import devnetRealms from "../public/realms/devnet.json";

// code copied from governance ui

const DEVNET_REALMS = parseCertifiedRealms(devnetRealms);

export interface RealmInfo {
  symbol: string;
  programId: PublicKey;
  programVersion?: number;
  realmId: PublicKey;
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

  // Allow Realm to send email/SMS/Telegram/etc., notifications to governance members using Notifi
  enableNotifi?: boolean;

  isCertified: boolean;

  // 3- featured DAOs  ,2- new DAO with active proposals, 1- DAOs with active proposal,
  sortRank?: number;

  // The default shared wallet of the DAO displayed on the home page
  // It's used for crowdfunding DAOs like  Ukraine.SOL or #Unchain_Ukraine
  sharedWalletId?: PublicKey;
}

interface RealmInfoAsJSON
  extends Omit<
    RealmInfo,
    "programId" | "realmId" | "isCertified" | "sharedWalletId"
  > {
  enableNotifi?: boolean;
  programId: string;
  realmId: string;
  sharedWalletId?: string;
}

function parseCertifiedRealms(realms: RealmInfoAsJSON[]) {
  return realms.map((realm) => ({
    ...realm,
    programId: new PublicKey(realm.programId),
    realmId: new PublicKey(realm.realmId),
    sharedWalletId: realm.sharedWalletId && new PublicKey(realm.sharedWalletId),
    isCertified: true,
    programVersion: realm.programVersion,
    enableNotifi: realm.enableNotifi ?? true, // enable by default
  })) as ReadonlyArray<RealmInfo>;
}

export function getCertifiedRealmInfos(cluster: string) {
  return cluster === "devnet" ? DEVNET_REALMS : null; // support only devnet?
}

function createUnchartedRealmInfo(realm: ProgramAccount<Realm>) {
  return {
    symbol: realm.account.name,
    programId: new PublicKey(realm.owner),
    realmId: realm.pubkey,
    displayName: realm.account.name,
    isCertified: false,
    enableNotifi: true, // enable by default
  } as RealmInfo;
}
