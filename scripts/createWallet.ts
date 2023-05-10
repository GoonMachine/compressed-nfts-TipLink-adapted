import {
    loadOrGenerateKeypair,
  } from "@/utils/helpers";

// generate a new keypair for use in this demo
 const payer = loadOrGenerateKeypair("payer");
 console.log(`Send 1.1 SOL to this wallet ${payer}`)

