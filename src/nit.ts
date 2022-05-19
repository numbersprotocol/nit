#!/usr/bin/env ts-node

import { ethers } from "ethers";
import fs = require("fs");

import * as action from "./action";
import * as ipfs from "./ipfs";
import * as license from "./license";

/*----------------------------------------------------------------------------
 * Configuration
 *----------------------------------------------------------------------------*/
const privateKeyLength = 64;
const infuraSecretLength = 27;
export const cidv1Length = 59;
export const assetCidMock = "a".repeat(cidv1Length);
export const nitconfigTemplate = {
  /* Author's Identity CID. */
  "author": "a".repeat(cidv1Length),
  /* Committer's Identity CID. */
  "committer": "a".repeat(cidv1Length),
  /* Provider's Identity CID. */
  "provider": "a".repeat(cidv1Length),
  "license": "cc-by-nc",
  "licenseContent": {
    "name": "",
    "document": ""
  },
  /* Which network config you want to use.
     One of the network names in the "network" section below.
     E.g., rinkeby */
  "defaultNetwork": "fuji",
  "network": {
    "rinkeby": {
      /* Provider's URL.
         If you are using RPC provider service like Alchemy or Infura,
         put the URL and API key here. */
      "url": "https://eth-rinkeby.alchemyapi.io/v2/{API_KEY}",
      /* Gas units consumed by a commit. */
      "gasLimit": 200000,
      /* Private key(s) of the Commit Tx sender. */
      "accounts": [
        "a".repeat(privateKeyLength)
      ],
      /* Integrity registration contract address. */
      "contract": "0x2Aa4e29872DE77E1Bc6cF310d647F9cB0f9a073B",
      "explorerBaseUrl": "https://rinkeby.etherscan.io/tx"
    },
    "avalanche": {
      "url": "https://api.avax.network/ext/bc/C/rpc",
      "accounts": [
        "a".repeat(privateKeyLength)
      ],
      "contract": "0x1970aFD0831E9233667fb9484910926c2b18BCb4",
      "explorerBaseUrl": "https://snowtrace.io/tx"
    },
    "fuji": {
      "url": "https://api.avax-test.network/ext/bc/C/rpc",
      "gasLimit": 200000,
      "accounts": [
        "a".repeat(privateKeyLength),
      ],
      "contract": "0xA2De03bee39Fa637440909abC5621063bC5DA926",
      "explorerBaseUrl": "https://testnet.snowtrace.io/tx"
    }
  },
  /* Infura IPFS project ID and secret for "IPFS add". */
  "infura": {
    "projectId": "a".repeat(infuraSecretLength),
    "projectSecret": "a".repeat(infuraSecretLength)
  }
};

export async function loadBlockchain(config, abi) {
  const networkConfig = config.network[config.defaultNetwork];
  const provider = new ethers.providers.JsonRpcProvider(networkConfig.url);

  const [signerPrivateKey, user] = networkConfig.accounts;
  let signer = new ethers.Wallet(signerPrivateKey);
  signer = signer.connect(provider);

  const contract = new ethers.Contract(networkConfig.contract, abi, signer);

  return {
    "contract": contract,
    "signer": signer,
    "gasLimit": networkConfig.gasLimit,
    "explorerBaseUrl": networkConfig.explorerBaseUrl,
    "provider": provider
  };
}

let stagingAssetTree: any = {};
let stagingCommit: any = {};

/*----------------------------------------------------------------------------
 * Commands
 *----------------------------------------------------------------------------*/
async function createAssetTreeBase(assetByes, assetMimetype) {
  stagingAssetTree = {};
  try {
    const ipfsAddResult = await ipfs.infuraIpfsAddBytes(assetByes, assetMimetype);
    stagingAssetTree.assetCid = ipfsAddResult.assetCid;
    // remove leading 0x to as the same as most sha256 tools
    stagingAssetTree.assetSha256 = (await ethers.utils.sha256(assetByes)).substring(2);
    stagingAssetTree.encodingFormat = ipfsAddResult.encodingFormat;
  } catch(error) {
    console.error(`${error}`);
    stagingAssetTree = {};
  }
  return stagingAssetTree;
}

async function createCommitBase(signer, authorCid, committerCid, providerCid) {
  stagingCommit = {};

  const assetTreeBytes = Buffer.from(JSON.stringify(stagingAssetTree, null, 2));
  const assetTreeMimetype = "application/json";

  stagingCommit.assetTreeCid = (await ipfs.infuraIpfsAddBytes(assetTreeBytes, assetTreeMimetype)).assetCid;
  // remove leading 0x to as the same as most sha256 tools
  stagingCommit.assetTreeSha256 = (await ethers.utils.sha256(Buffer.from(JSON.stringify(stagingAssetTree, null, 2)))).substring(2);
  stagingCommit.assetTreeSignature = await signIntegrityHash(stagingCommit.assetTreeSha256, signer);
  stagingCommit.author = authorCid;
  stagingCommit.committer = committerCid;
  stagingCommit.provider = providerCid;
  stagingCommit.timestampCreated = Math.floor(Date.now() / 1000);

  return stagingCommit;
}

export async function createAssetTreeInitialRegister(assetBytes,
                                                     assetMimetype,
                                                     assetTimestampCreated,
                                                     assetCreatorCid,
                                                     assetLicense="cc-by-nc",
                                                     assetAbstract="") {
  stagingAssetTree = await createAssetTreeBase(assetBytes, assetMimetype);
  stagingAssetTree.assetTimestampCreated= assetTimestampCreated;
  stagingAssetTree.assetCreator = assetCreatorCid;
  stagingAssetTree.license = license.Licenses[assetLicense];
  stagingAssetTree.abstract = assetAbstract;
  return stagingAssetTree;
}

export async function createCommitInitialRegister(signer, authorCid, committerCid, providerCid) {
  stagingCommit = await createCommitBase(signer, authorCid, committerCid, providerCid);
  stagingCommit.action = action.Actions["action-initial-registration"];
  stagingCommit.actionResult = `https://${stagingCommit.assetTreeCid}.ipfs.dweb.link`;
  stagingCommit.abstract = "Action action-initial-registration.";
  stagingCommit.timestampCreated = Math.floor(Date.now() / 1000);
  return stagingCommit;
}

/*
export async function createCommitMintErc721Nft(signer, authorCid, committerCid, providerCid, actionIndex, actionResult) {
  stagingCommit = await createCommitBase(signer, authorCid, committerCid, providerCid);
  stagingCommit.action = action.Actions[actionIndex];
  stagingCommit.actionResult = actionResult;
  stagingCommit.abstract = "Mint ERC-721 NFT.";
  stagingCommit.timestampCreated = Math.floor(Date.now() / 1000);
  return stagingCommit;
}
*/

export async function commit(assetCid: string, commitData: string, blockchainInfo) {
  const r = await blockchainInfo.contract.commit(assetCid, commitData, { gasLimit: blockchainInfo.gasLimit });
  return r;
}

export async function log(assetCid: string, blockchainInfo) {
  const network = await blockchainInfo.provider.getNetwork();
  if (network.chainId === 4) {
    // Ethereum Rinkeby
    await eventLogRangeQuery(assetCid, blockchainInfo);
  } else if (network.chainId === 43113) {
    // Avalanche Fuji
    await eventLogIteratingQuery(assetCid, blockchainInfo);
  } else {
    console.log(`Unknown chain ID ${network.chainId}`);
  }
}

export async function getLatestCommitBlock(assetCid, blockchainInfo) {
  const commitBlockNumbers = await blockchainInfo.contract.getCommits(assetCid);
  return commitBlockNumbers[commitBlockNumbers.length - 1].toNumber();
}

export async function getLatestCommitSummary(assetCid, blockchainInfo) {
  const commitBlockNumber = await getLatestCommitBlock(assetCid, blockchainInfo);
  const filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  let events = await blockchainInfo.contract.queryFilter(filter, commitBlockNumber, commitBlockNumber);
  const commitDataIndex = 2;
  return {
    "blockNumber": commitBlockNumber,
    "commit": JSON.parse(events[0].args![commitDataIndex])
  }
}

export async function getAssetTree(assetTreeCid) {
  const assetTreeBytes = await ipfs.infuraIpfsCat(assetTreeCid);
  const assetTree = JSON.parse(assetTreeBytes.toString());
  return assetTree;
}

async function eventLogRangeQuery(assetCid: string, blockchainInfo) {
  console.log(`Commit logs of assetCid: ${assetCid}`);
  const commits = await blockchainInfo.contract.getCommits(assetCid);
  console.log(`Commit block numbers (${commits.length}):`);
  if (commits.length > 0) {
    console.log(`${commits.map(this.toString)}`);
  } else {
    return;
  }

  // Get events
  const filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  filter.fromBlock = commits[0].toNumber();
  filter.toBlock = commits[commits.length - 1].toNumber();
  let events = await blockchainInfo.contract.queryFilter(filter, filter.fromBlock, filter.toBlock);
  const commitDataIndex = 2;
  for (const event of events) {
    console.log(`\nBlock ${event.blockNumber}`);
    console.log(`${blockchainInfo.explorerBaseUrl}/${event.transactionHash}`)
    console.log(`Commit: ${JSON.stringify(JSON.parse(event.args![commitDataIndex]), null, 2)}`);
  }
}

async function eventLogIteratingQuery(assetCid: string, blockchainInfo) {
  console.log(`assetCid: ${assetCid}`);
  const commits = await blockchainInfo.contract.getCommits(assetCid);
  console.log(`Commit block numbers (${commits.length}):`);
  if (commits.length > 0) {
    for (const c of commits) {
      console.log(`\t${c.toString()}`);
    }
  } else {
    return;
  }

  /* WORKAROUND: create filters for every commit because Avalanche
   * only supports 2048-block range in an event log query.
   *
   * The query performance is more worse than eventLogRangeQuery,
   * but it's acceptable on Avalanche.
   */
  // Create event log filter
  let filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  const abi = [
    "event Commit(address indexed recorder, string indexed assetCid, string commitData)"
  ];
  console.log(`Filter: ${JSON.stringify(filter, null, 2)}`);
  for (const c of commits) {
    // Get event log by filter
    filter.fromBlock = c.toNumber();
    filter.toBlock = c.toNumber();
    const eventLogs = await blockchainInfo.provider.getLogs(filter);

    const commitEventInterface = new ethers.utils.Interface(abi);
    for (const eventLog of eventLogs) {
      console.log(`\nBlock number: ${(eventLog.blockNumber)}`);
      console.log(`${blockchainInfo.explorerBaseUrl}/${(eventLog.transactionHash)}`);

      const commitEvent = commitEventInterface.parseLog(eventLog);
      console.log(`commitEvent: ${JSON.stringify(commitEvent, null, 2)}`);

      try {
        const commitData = JSON.parse(commitEvent.args[2]);
        console.log(`Commit: ${JSON.stringify(commitData, null, 2)}`);
      } catch (error) {
        console.error(`Failed to parse Commit, error: ${error}`);
      }
    }
  }
}

/*----------------------------------------------------------------------------
 * Ethereum Signature
 *----------------------------------------------------------------------------*/
export async function signIntegrityHash(sha256sum: string, signer) {
  let signature = await signer.signMessage(sha256sum);
  return signature;
}

export async function verifyIntegrityHash(sha256sum: string, signature) {
  const recoveredAddress = await ethers.utils.verifyMessage(sha256sum, signature);
  return recoveredAddress;
}