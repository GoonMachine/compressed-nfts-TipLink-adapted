import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import { Keypair, PublicKey } from "@solana/web3.js";

export type NFTMetadata = {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url: string;
  attributes: { [k: string] : string }[];
  // ...other properties...
};

export const nftMetadatas: NFTMetadata[] = [
  {
    name: "Compressed NFT 1",
    symbol: "Testy Test",
    description: "",
    image: "https://shdw-drive.genesysgo.net/HcnRQ2WJHfJzSgPrs4pPtEkiQjYTu1Bf6DmMns1yEWr8/1.json",
    external_url: "",
    attributes: [
      {
      trait_type: "Gender",
      value: "Female",
      }
    ],
  },
  {
    name: "Compressed NFT 2",
    symbol: "Testy Test",
    description: "",
    image: "https://shdw-drive.genesysgo.net/HcnRQ2WJHfJzSgPrs4pPtEkiQjYTu1Bf6DmMns1yEWr8/1.json",
    external_url: "",
    attributes: [
      {
      trait_type: "Gender",
      value: "Female",
      }
    ],
      
  },
  // ...more NFT metadata...
];


export const createCompressedNFTMetadata = (nftMetadata: NFTMetadata, payer: Keypair, tipLinkPubKey: PublicKey): MetadataArgs => {
  return {
    name: nftMetadata.name,
    symbol: nftMetadata.symbol,
    // specific json metadata for each NFT
    uri: nftMetadata.image,
    creators: [
      {
        address: payer.publicKey,
        verified: false,
        share: 100,
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
};


// export const compressedNFTMetadata: MetadataArgs = {
//   name: nftMetadatas[0].name,
//   symbol: nftMetadatas[0].symbol,
//   // specific json metadata for each NFT
//   uri: nftMetadatas[0].uri,
//   creators: [
//     {
//       address: payer.publicKey,
//       verified: false,
//       share: 100,
//     },
//     {
//       address: tipLinkPubKey,
//       verified: false,
//       share: 0,
//     },
//   ],
//   editionNonce: 0,
//   uses: null,
//   collection: null,
//   primarySaleHappened: false,
//   sellerFeeBasisPoints: 0,
//   isMutable: false,
//   // values taken from the Bubblegum package
//   tokenProgramVersion: TokenProgramVersion.Original,
//   tokenStandard: TokenStandard.NonFungible,
// };