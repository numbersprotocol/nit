import { ethers } from "ethers";

import * as action from "./action";
import * as integrityContract from "./contract";
import * as ipfs from "./ipfs";
import * as license from "./license";
import * as util from "./util";

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

export async function loadBlockchain(config) {
  const networkConfig = config.network[config.defaultNetwork];
  const provider = new ethers.providers.JsonRpcProvider(networkConfig.url);
  const contractAbi = integrityContract.abi;

  const [signerPrivateKey, user] = networkConfig.accounts;
  let signer = new ethers.Wallet(signerPrivateKey);
  signer = signer.connect(provider);

  const contract = new ethers.Contract(networkConfig.contract, contractAbi, signer);

  return {
    "contract": contract,
    "signer": signer,
    "gasLimit": networkConfig.gasLimit,
    "explorerBaseUrl": networkConfig.explorerBaseUrl,
    "provider": provider
  };
}

const configurableAssetTreeKeys = [
  "assetCreator",
  "assetTimestampCreated",
  "license",
  "nftRecord",
  "integrityCid",
  "abstract",
  "encodingFormat",
];

/*----------------------------------------------------------------------------
 * Commands
 *----------------------------------------------------------------------------*/
async function createAssetTreeBaseRemote(assetByes, assetMimetype) {
  let stagingAssetTree: any = {};
  try {
    stagingAssetTree.assetCid = await ipfs.infuraIpfsAddBytes(assetByes);
    // remove leading 0x to as the same as most sha256 tools
    stagingAssetTree.assetSha256 = (await ethers.utils.sha256(assetByes)).substring(2);
    stagingAssetTree.encodingFormat = assetMimetype;
  } catch(error) {
    console.error(`${error}`);
    stagingAssetTree = {};
  }
  return stagingAssetTree;
}

async function createAssetTreeBase(assetCid, assetSha256, assetMimetype) {
  let stagingAssetTree: any = {};
  try {
    stagingAssetTree.assetCid = assetCid;
    stagingAssetTree.assetSha256 = assetSha256
    stagingAssetTree.encodingFormat = assetMimetype;
  } catch(error) {
    console.error(`${error}`);
    stagingAssetTree = {};
  }
  return stagingAssetTree;
}

async function createCommitBase(signer, assetTree, authorCid, committerCid, providerCid) {
  let stagingCommit: any = {};

  const assetTreeBytes = Buffer.from(JSON.stringify(assetTree, null, 2));
  stagingCommit.assetTreeCid = await ipfs.infuraIpfsAddBytes(assetTreeBytes);
  stagingCommit.assetTreeSha256 = (await ethers.utils.sha256(Buffer.from(JSON.stringify(assetTree, null, 2)))).substring(2);
  // remove leading 0x to as the same as most sha256 tools
  stagingCommit.assetTreeSignature = await signIntegrityHash(stagingCommit.assetTreeSha256, signer);
  stagingCommit.author = authorCid;
  stagingCommit.committer = committerCid;
  stagingCommit.provider = providerCid;
  stagingCommit.timestampCreated = Math.floor(Date.now() / 1000);

  return stagingCommit;
}

export async function createAssetTreeInitialRegisterRemote(assetBytes,
                                                           assetMimetype,
                                                           assetTimestampCreated,
                                                           assetCreatorCid,
                                                           assetLicense="cc-by-nc",
                                                           assetAbstract="") {
  let stagingAssetTree = await createAssetTreeBaseRemote(assetBytes, assetMimetype);
  stagingAssetTree.assetTimestampCreated= assetTimestampCreated;
  stagingAssetTree.assetCreator = assetCreatorCid;
  stagingAssetTree.license = license.Licenses[assetLicense];
  stagingAssetTree.abstract = assetAbstract;
  return stagingAssetTree;
}

export async function createAssetTreeInitialRegister(assetCid,
                                                     assetSha256,
                                                     assetMimetype,
                                                     assetTimestampCreated,
                                                     assetCreatorCid,
                                                     assetLicense="cc-by-nc",
                                                     assetAbstract="") {
  let stagingAssetTree = await createAssetTreeBase(assetCid, assetSha256, assetMimetype);
  stagingAssetTree.assetTimestampCreated= assetTimestampCreated;
  stagingAssetTree.assetCreator = assetCreatorCid;
  stagingAssetTree.license = license.Licenses[assetLicense];
  stagingAssetTree.abstract = assetAbstract;
  return stagingAssetTree;
}

export async function createCommitInitialRegister(signer, assetTree, authorCid, committerCid, providerCid) {
  let stagingCommit = await createCommitBase(signer, assetTree, authorCid, committerCid, providerCid);
  stagingCommit.action = action.Actions["action-initial-registration"];
  stagingCommit.actionResult = `https://${stagingCommit.assetTreeCid}.ipfs.dweb.link`;
  stagingCommit.abstract = "Action action-initial-registration.";
  stagingCommit.timestampCreated = Math.floor(Date.now() / 1000);
  return stagingCommit;
}

export async function createCommit(signer, assetTree, authorCid, committerCid, providerCid) {
  let stagingCommit = await createCommitBase(signer, assetTree, authorCid, committerCid, providerCid);
  stagingCommit.action = "";
  stagingCommit.actionResult = "";
  stagingCommit.abstract = `Nit Commit created by ${signer.address}.`;
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

export async function updateAssetTreeLegacy(assetTree, assetTreeUpdates) {
  const assetTreeKeySet = new Set(configurableAssetTreeKeys);
  const assetTreeUpdatesKeySet = new Set(Object.keys(assetTreeUpdates));

  const isSuperset = util.isSuperset(assetTreeKeySet, assetTreeUpdatesKeySet);

  if (isSuperset) {
    for (let key of Object.keys(assetTreeUpdates)) {
      assetTree[key] = assetTreeUpdates[key];
    }
    return assetTree;
  } else {
    // find illegal assetTreeUpdates, return assetTree directly
    console.log(`Asset Tree Updates is not a legal subset`);
    return assetTree
  }
}

export async function updateAssetTree(assetTree, assetTreeUpdates) {
  /* Extend Asset Tree with given updates.
   */
  let assetTreeCopy = util.deepCopy(assetTree);
  for (let key of Object.keys(assetTreeUpdates)) {
    assetTreeCopy[key] = assetTreeUpdates[key];
  }
  return assetTreeCopy;
}

export async function pull(assetCid: string, blockchainInfo) {
  const latestCommit = await getLatestCommitSummary(assetCid, blockchainInfo);
  if (latestCommit != null) {
    const assetTree = await getAssetTree(latestCommit.commit.assetTreeCid);
    return assetTree;
  } else {
    return null
  }
}

//export async function add(assetCid, assetUpdates, blockchainInfo) {
//  const latestAssetTree = await pull(assetCid, blockchainInfo);
//  if (latestAssetTree != null) {
//    return await updateAssetTree(latestAssetTree, assetUpdates);
//  } else {
//    // Asset has not been registered
//  }
//}

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
  /* Returns
   *   Commit Block Number: if Asset Cid has been registerd
   *   null: if Asset Cid has NOT been registerd
   */
  const commitBlockNumbers = await blockchainInfo.contract.getCommits(assetCid);
  if (commitBlockNumbers.length > 0) {
    return commitBlockNumbers[commitBlockNumbers.length - 1].toNumber();
  } else {
    // Asset CID has not been registered
    return null;
  }
}

export async function getLatestCommitSummary(assetCid, blockchainInfo) {
  const commitBlockNumber = await getLatestCommitBlock(assetCid, blockchainInfo);
  let filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  filter.fromBlock = commitBlockNumber;
  filter.toBlock = commitBlockNumber;
  const eventLogs = await blockchainInfo.provider.getLogs(filter);
  const abi = [
    "event Commit(address indexed recorder, string indexed assetCid, string commitData)"
  ];
  const commitEventInterface = new ethers.utils.Interface(abi);

  if (eventLogs.length === 1) {
    const commitEvent = commitEventInterface.parseLog(eventLogs[0]);
    try {
      const commitDataIndex = 2;
      const commitData = JSON.parse(commitEvent.args[commitDataIndex]);
      return {
        "blockNumber": eventLogs[0].blockNumber,
        "txHash": eventLogs[0].transactionHash,
        "commit": commitData,
      }
    } catch (error) {
      console.error(`Failed to parse Commit, error: ${error}`);
      return null
    }
  } else {
    console.log(`ERROR: eventLogs.length: ${eventLogs.length}`);
    return null
  }

  /*
  let events = await blockchainInfo.contract.queryFilter(filter, commitBlockNumber, commitBlockNumber);
  if (events.length === 1) {
    const commitDataIndex = 2;
    return {
      "blockNumber": commitBlockNumber,
      "commit": JSON.parse(events[0].args![commitDataIndex])
    }
  } else {
    // Asset has not been registered
    return null;
  }
  */
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