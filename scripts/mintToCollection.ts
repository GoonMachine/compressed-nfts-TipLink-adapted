/*
  This script demonstrates how to mint an additional compressed NFT to an existing tree and/or collection
  ---
  NOTE: A collection can use multiple trees to store compressed NFTs, as desired. 
  This example uses the same tree for simplicity.
*/

import { PublicKey, clusterApiUrl, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";

// import custom helpers to mint compressed NFTs
import { WrapperConnection } from "@/ReadApi/WrapperConnection";
import { mintCompressedNFT } from "@/utils/compression";
import {
  loadKeypairFromFile,
  loadOrGenerateKeypair,
  loadPublicKeysFromFile,
  printConsoleSeparator,
} from "@/utils/helpers";

// load the env variables and store the cluster RPC url
import dotenv from "dotenv";
import { TipLink } from "@tiplink/api";
dotenv.config();

// Array of metadata for each NFT
const nftMetadatas: NFTMetadata[] = [
  {
    name: "Compressed NFT 1",
    uri: "https://shdw-drive.genesysgo.net/HcnRQ2WJHfJzSgPrs4pPtEkiQjYTu1Bf6DmMns1yEWr8/1.json",
    symbol:"Testy Test"
    // ...other properties...
  },
  {
    name: "Compressed NFT 2",
    uri: "https://shdw-drive.genesysgo.net/HcnRQ2WJHfJzSgPrs4pPtEkiQjYTu1Bf6DmMns1yEWr8/1.json",
    symbol:"Testy Test"
    // ...other properties...
  },
  // ...more NFT metadata...
];

type NFTMetadata = {
  name: string;
  uri: string;
  symbol: string;
  // ...other properties...
};


const TIPLINK_MINIMUM_LAMPORTS = 1_000_000;

const createAndFundTiplink = async (
  connection: WrapperConnection,
  payer: Keypair,
  treeAddress: PublicKey,
  collectionMint: PublicKey,
  collectionMetadataAccount: PublicKey,
  collectionMasterEditionAccount: PublicKey,
  nftMetadata: NFTMetadata
) => {  const tipLink = await TipLink.create();
  const tipLinkPubKey = tipLink.keypair.publicKey;
  console.log(tipLink.url.href);
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: tipLink.keypair.publicKey,
      lamports: TIPLINK_MINIMUM_LAMPORTS,
    }),
  );

  await sendAndConfirmTransaction(connection, transaction, [payer], {commitment: 'confirmed'});

  const compressedNFTMetadata: MetadataArgs = {
    name: nftMetadata.name,
    symbol: nftMetadata.symbol,
    // specific json metadata for each NFT
    uri: nftMetadata.uri,
    creators: [
      {
        address: payer.publicKey,
        verified: false,
        share: 100,
      },
      {
        address: tipLinkPubKey,
        verified: false,
        share: 0,
      },
    ],
    editionNonce: 0,
    uses: null,
    collection: null,
    primarySaleHappened: false,
    sellerFeeBasisPoints: 0,
    isMutable: false,
    // values taken from the Bubblegum package
    tokenProgramVersion: TokenProgramVersion.Original,
    tokenStandard: TokenStandard.NonFungible,
  };

  console.log(`Minting a single compressed NFT to ${tipLinkPubKey.toBase58()}...`);

  await mintCompressedNFT(
    connection,
    payer,
    treeAddress,
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
    compressedNFTMetadata,
    // mint to this specific wallet (in this case, airdrop to `testWallet`)
    tipLinkPubKey,
  );
};

(async () => {
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


  // generate a new keypair for use in this demo (or load it locally from the filesystem when available)
  const payer = process.env?.LOCAL_PAYER_JSON_ABSPATH
    ? loadKeypairFromFile(process.env?.LOCAL_PAYER_JSON_ABSPATH)
    : loadOrGenerateKeypair("payer");

  console.log("Payer address:", payer.publicKey.toBase58());
  
  const TIPLINK_MINIMUM_LAMPORTS = 1_000_000

  // load the stored PublicKeys for ease of use
  let keys = loadPublicKeysFromFile();

  // ensure the primary script was already run
  if (!keys?.collectionMint || !keys?.treeAddress)
    return console.warn("No local keys were found. Please run the `index` script");

  const treeAddress: PublicKey = keys.treeAddress;
  const treeAuthority: PublicKey = keys.treeAuthority;
  const collectionMint: PublicKey = keys.collectionMint;
  const collectionMetadataAccount: PublicKey = keys.collectionMetadataAccount;
  const collectionMasterEditionAccount: PublicKey = keys.collectionMasterEditionAccount;

  console.log("==== Local PublicKeys loaded ====");
  console.log("Tree address:", treeAddress.toBase58());
  console.log("Tree authority:", treeAuthority.toBase58());
  console.log("Collection mint:", collectionMint.toBase58());
  console.log("Collection metadata:", collectionMetadataAccount.toBase58());
  console.log("Collection master edition:", collectionMasterEditionAccount.toBase58());

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  // load the env variables and store the cluster RPC url
  const CLUSTER_URL = process.env.RPC_URL ?? clusterApiUrl("mainnet-beta");

  // create a new rpc connection, using the ReadApi wrapper
  const connection = new WrapperConnection(CLUSTER_URL);

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  printConsoleSeparator();

  for (const nftMetadata of nftMetadatas) {
    await createAndFundTiplink(
      connection,
      payer,
      treeAddress,
      collectionMint,
      collectionMetadataAccount,
      collectionMasterEditionAccount,
      nftMetadata // pass the current NFTMetadata object
    );
  }

})();
