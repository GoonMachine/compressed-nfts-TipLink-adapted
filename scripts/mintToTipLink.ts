/*
  This script demonstrates how to mint an additional compressed NFT to an existing tree and/or collection
  ---
  NOTE: A collection can use multiple trees to store compressed NFTs, as desired. 
  This example uses the same tree for simplicity.
*/
import { PublicKey, clusterApiUrl, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";

// import custom helpers to mint compressed NFTs
import { WrapperConnection } from "@/ReadApi/WrapperConnection";
import { mintCompressedNFTIxn } from "@/utils/compression";
import {
  explorerURL,
  loadOrGenerateKeypair,
  loadPublicKeysFromFile,
  printConsoleSeparator,
} from "@/utils/helpers";

// load the env variables and store the cluster RPC url
import dotenv from "dotenv";

// import the NFTMetadata
import { createCompressedNFTMetadata, NFTMetadata, nftMetadatas } from '@/onChainNftMetadata/onChainNFTs';
import { extractSignatureFromFailedTransaction } from "@/utils/helpers";

// import fs to write the TipLink wallet URLs to a CSV file
import fs from "fs";


dotenv.config();

const TIPLINK_MINIMUM_LAMPORTS = 1_000_000;

const createAndFundTipLink = async (
  connection: WrapperConnection,
  payer: Keypair,
  treeAddress: PublicKey,
  collectionMint: PublicKey,
  collectionMetadataAccount: PublicKey,
  collectionMasterEditionAccount: PublicKey,
  nftMetadata: NFTMetadata
) => {  

  //Add the function to create a TipLink and update the tipLinkPubKey variable

  const tipLinkPubKey = new PublicKey("Change this out for the created TipLink public key")
  
  
    const csvData = `${tipLink.url.href}\n`;
    fs.appendFileSync("outputTipLink.csv", csvData, "utf8");
    
    
  const compressedNFTMetadata = createCompressedNFTMetadata(nftMetadata, payer);
  const mintIxn = mintCompressedNFTIxn(
    payer,
    treeAddress,
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
    compressedNFTMetadata,
    tipLinkPubKey,
  );

  try {
    // construct the transaction with our instructions, making the `payer` the `feePayer`
    const tx = new Transaction().add(
      // We'll add a small amount of lamports to the TipLink account
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: tipLinkPubKey,
        lamports: TIPLINK_MINIMUM_LAMPORTS,
      }),
      mintIxn,
    );
    tx.feePayer = payer.publicKey;

    // send the transaction to the cluster
    const txSignature = await sendAndConfirmTransaction(connection, tx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
    });

    console.log("\nSuccessfully minted the compressed NFT!");
    console.log(explorerURL({ txSignature, cluster: "mainnet-beta" }));

    return txSignature;
  } catch (err) {
    console.error("\nFailed to mint compressed NFT:", err);

    // log a block explorer link for the failed transaction
    await extractSignatureFromFailedTransaction(connection, err);

    throw err;
  }
};

(async () => {
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////


  // generate a new keypair for use in this demo
  const payer = loadOrGenerateKeypair("payer");

  console.log("Payer address:", payer.publicKey.toBase58());
  
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
    console.log(nftMetadata);
    await createAndFundTipLink(
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
