#!/usr/bin/env ts-node

/*
Execution: ts-node parseTxNid.ts
Output: Nid: bafybeiajl3iadbz5phbig6ojxrau22a67lzrba2srdqn2jzy3bpl7oxd6u
*/

import * as ethers from "ethers";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://mainnetrpc.num.network");
  // Tx Sample: https://mainnet.num.network/transaction/0xca942395e9c36b3217422979978838a45891336ca54bb036d6aecd43f0b56187
  const txHash = "0xca942395e9c36b3217422979978838a45891336ca54bb036d6aecd43f0b56187";

  // parse the transaction with the function signature
  const abi = [ "function commit(string memory assetCid, string memory commitData) public returns (uint256 blockNumber)" ];
  const iface = new ethers.utils.Interface(abi);

  const txData = await provider.getTransaction(txHash);
  // uncomment the following line to see the raw transaction data
  //console.log(txData);

  const decodedTxData = iface.parseTransaction(txData);
  // uncomment the following line to see the decoded transaction data
  //console.log(decodedTxData);

  console.log(`Nid: ${decodedTxData.args[0]}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
