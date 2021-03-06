import { ethers } from "ethers";

import * as action from "./action";
import * as integrityContract from "./contract";
import * as ipfs from "./ipfs";
import * as license from "./license";
import * as util from "./util";

import * as colors from "colors";
import * as diff from "diff";

colors.enable();

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
    "gasPrice": networkConfig.gasPrice ? networkConfig.gasPrice : null,
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
  let r;
  if (blockchainInfo.gasPrice != null) {
    console.log(`Gas Price: ${blockchainInfo.gasPrice} Wei`);
    r = await blockchainInfo.contract.commit(assetCid, commitData, { gasLimit: blockchainInfo.gasLimit, gasPrice: blockchainInfo.gasPrice });
  } else {
    r = await blockchainInfo.contract.commit(assetCid, commitData, { gasLimit: blockchainInfo.gasLimit });
  }
  return r;
}

export async function log(assetCid: string, blockchainInfo, fromIndex: number, toIndex: number = null) {
  const network = await blockchainInfo.provider.getNetwork();
  if (network.chainId === 4 || network.chainId === 1313161555) {
    // Ethereum Rinkeby
    await eventLogRangeQuery(assetCid, blockchainInfo);
  } else if (network.chainId === 43113 || network.chainId === 43114) {
    // Avalanche: 43114, Fuji: 43113

    if (toIndex <= fromIndex) {
      const commitBlockNumbers = await getCommitBlockNumbers(assetCid, blockchainInfo);
      const commitAmount: number = commitBlockNumbers.length;
      toIndex = commitAmount;
    }

    const commitEvents = await iterateCommitEvents(assetCid, blockchainInfo, fromIndex, toIndex);
    const commits = await getCommits(commitEvents);
    commits.map(commit => {
      console.log(`\nblock number: ${colors.blue(commit.blockNumber)}`);
      console.log(`tx: ${colors.green(commit.transactionHash)}`);
      console.log(`${JSON.stringify(commit.commit, null, 2)}`);
    });
  } else {
    console.log(`Unknown chain ID ${network.chainId}`);
  }
}

export async function showCommmitDiff(commitDiff) {
  commitDiff.forEach((part) => {
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    console.log(`${part.value.replace(/\n$/, "")[color]}`);
  });
}

export async function difference(assetCid: string, blockchainInfo, fromIndex: number = null, toIndex: number = null) {
  const commitBlockNumbers = await getCommitBlockNumbers(assetCid, blockchainInfo);
  const commitAmount = commitBlockNumbers.length;

  // show the Commit diff between (latest - 1, latest)
  if (fromIndex == null) {
    toIndex = commitAmount;
    fromIndex = toIndex - 2;
  }

  const commitEvents = await iterateCommitEvents(assetCid, blockchainInfo, fromIndex, fromIndex < toIndex ? toIndex : fromIndex + 1);
  const commits = await getCommits(commitEvents);
  const fromCommit = commits[0];
  const toCommit = commits[commits.length - 1];
  const fromAssetTree = JSON.parse((await ipfs.infuraIpfsCat(fromCommit.commit.assetTreeCid)).toString());
  const toAssetTree = JSON.parse((await ipfs.infuraIpfsCat(toCommit.commit.assetTreeCid)).toString());
  const commitDiff = {
    "fromIndex": fromIndex,
    "fromBlockNumber": fromCommit.blockNumber,
    "fromTransactionHash": fromCommit.transactionHash,
    "toIndex": toIndex,
    "toBlockNumber": toCommit.blockNumber,
    "toTransactionHash": toCommit.transactionHash,
    "commitDiff": diff.diffJson(fromCommit.commit, toCommit.commit),
    "assetTreeDiff": diff.diffJson(fromAssetTree, toAssetTree),
  }
  return commitDiff;
}

export async function getLatestCommitSummary(assetCid, blockchainInfo) {
  const commitBlockNumbers = await getCommitBlockNumbers(assetCid, blockchainInfo);
  const commitAmount = commitBlockNumbers.length;
  const events = await iterateCommitEvents(assetCid, blockchainInfo, commitAmount - 1, commitAmount);
  const commitsSummary = await getCommitsSummary(events);
  return commitsSummary.pop();
}

export async function getAssetTree(assetTreeCid) {
  const assetTreeBytes = await ipfs.infuraIpfsCat(assetTreeCid);
  const assetTree = JSON.parse(assetTreeBytes.toString());
  return assetTree;
}

export async function getCommitBlockNumbers(assetCid: string, blockchainInfo) {
  const commits = await blockchainInfo.contract.getCommits(assetCid);
  return commits.length > 0 ? commits.map(element => element.toNumber()) : [];
}

export async function filterCommitEvents(assetCid: string, blockchainInfo, fromIndex, toIndex) {
  /* Have 3 more keys than eventLog in iterateCommitEvents: event, eventSignature, args
   *
   * keys:
   *   blockNumber, blockHash, transactionIndex, removed, address, data, topics
   *   transactionHash, logIndex, event, eventSignature, args
   */
  const commitBlockNumbers = (await getCommitBlockNumbers(assetCid, blockchainInfo)).slice(fromIndex, toIndex);
  const commitAmount = commitBlockNumbers.length;

  if (commitAmount == 0) { return []; }

  const filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  filter.fromBlock = commitBlockNumbers[0];
  filter.toBlock = commitBlockNumbers[commitAmount - 1];

  let events = await blockchainInfo.contract.queryFilter(filter, filter.fromBlock, filter.toBlock);
  return events;
}

export async function iterateCommitEvents(assetCid: string, blockchainInfo, fromIndex, toIndex) {
  /* Get Commit events by using low-level event logs.
   *
   * If a blockchain provider does not support getting events by filter,
   * (e.g., Avalanche), you can use this function.
   *
   * keys in eventLog:
   *   blockNumber, blockHash, transactionIndex, removed, address, data, topics
   *   transactionHash, logIndex,
   * keys in commitEvent:
   *   eventFragment, name, signature, args, topic, args
   */
  const commitBlockNumbers = (await getCommitBlockNumbers(assetCid, blockchainInfo)).slice(fromIndex, toIndex);
  const commitAmount = commitBlockNumbers.length;

  if (commitAmount == 0) { return []; }

  const filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  const abi = [
    "event Commit(address indexed recorder, string indexed assetCid, string commitData)"
  ];
  const commitEventInterface = new ethers.utils.Interface(abi);

  let events = [];

  for (const c of commitBlockNumbers) {
    filter.fromBlock = c;
    filter.toBlock = c;
    const eventLogs = await blockchainInfo.provider.getLogs(filter);

    for (const eventLog of eventLogs) {
      const commitEvent = commitEventInterface.parseLog(eventLog);
      // merge eventLog and commitEvent
      events.push(Object.assign({}, eventLog, commitEvent));
    }
  }

  return events;
}

export async function getCommits(events) {
  const commitDataIndex = 2;
  const commits = events.map(event => {
    let commit;
    try {
        commit = JSON.parse(event.args[commitDataIndex]);
    } catch (error) {
        console.error(`Cannot get valid Commit from block ${event.blockNumber}`);
        commit = {};
    }
    return {
      "blockNumber": event.blockNumber,
      "transactionHash": event.transactionHash,
      "commit": commit,
    };
  });
  return commits;
}

export async function getCommitsSummary(events) {
  const commitDataIndex = 2;
  const commitsSummary = events.map(element => {
    let summary = { blockNumber: 0, txHash: "", commit: {} };
    summary.commit = JSON.parse(element.args[commitDataIndex]);
    summary.blockNumber = element.blockNumber;
    summary.txHash = element.transactionHash;
    return summary;
  });
  return commitsSummary;
}

async function eventLogRangeQuery(assetCid: string, blockchainInfo) {
  console.log(`Commit logs of assetCid: ${assetCid}`);

  const commitBlockNumbers = await getCommitBlockNumbers(assetCid, blockchainInfo);
  const commitAmount = commitBlockNumbers.length;
  console.log(`Commit block numbers (${commitBlockNumbers.length}):`);
  if (commitAmount > 0) {
    console.log(`${JSON.stringify(commitBlockNumbers)}`);
  } else {
    return;
  }

  // Get events
  const filter = await blockchainInfo.contract.filters.Commit(null, assetCid);
  filter.fromBlock = commitBlockNumbers[0];
  filter.toBlock = commitBlockNumbers[commitAmount - 1];
  let events = await blockchainInfo.contract.queryFilter(filter, filter.fromBlock, filter.toBlock);
  const commitDataIndex = 2;
  for (const event of events) {
    console.log(`\nBlock ${event.blockNumber}`);
    console.log(`${blockchainInfo.explorerBaseUrl}/${event.transactionHash}`)
    console.log(`Commit: ${JSON.stringify(JSON.parse(event.args![commitDataIndex]), null, 2)}`);
  }
}

/* TODO: Remove this function in the next feature release.
 */
async function eventLogIteratingQuery(assetCid: string, blockchainInfo) {
  console.log(`assetCid: ${assetCid}`);

  const commitBlockNumbers = await getCommitBlockNumbers(assetCid, blockchainInfo);
  const commitAmount = commitBlockNumbers.length;
  console.log(`Commit block numbers (${commitBlockNumbers.length}):`);
  if (commitAmount > 0) {
    console.log(`${JSON.stringify(commitBlockNumbers)}`);
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
  for (const c of commitBlockNumbers) {
    // Get event log by filter
    filter.fromBlock = c;
    filter.toBlock = c;
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