import { ethers, utils } from "ethers";

import * as ipfs from "./ipfs";
import * as nit from "./nit";
import * as util from "./util";

interface ExtendedCommit {
  blockNumber;
  transactionHash;
  commit;
  assetCid;
  assetTree;
  author;
  committer;
  provider;
  license;
  action;
  integrity;
  assetCreatedIsoTime: string;
  commitCreatedIsoTime: string;
  blockchain: string;
}

async function extend(commitSummary, blockchainName) {
  const blockNumber = commitSummary.blockNumber ;
  const transactionHash = commitSummary.transactionHash;
  const commitObject = commitSummary.commit;
  const commit = JSON.stringify(commitObject);

  const author = await ipfs.cidToJsonString(commitObject.author);
  const committer = await ipfs.cidToJsonString(commitObject.committer);
  const provider = await ipfs.cidToJsonString(commitObject.provider);
  const action = await ipfs.cidToJsonString(commitObject.action);
  const commitCreatedIsoTime = util.timestampToIsoString(commitObject.timestampCreated);
  const assetTree = await ipfs.cidToJsonString(commitObject.assetTreeCid);
  const assetTreeObject = JSON.parse(assetTree);
  const assetCid = assetTreeObject.assetCid;
  const license = await ipfs.cidToJsonString(assetTreeObject.provider);
  const integrity = await ipfs.cidToJsonString(assetTreeObject.integrityCid);
  const assetCreatedIsoTime = util.timestampToIsoString(assetTreeObject.assetTimestampCreated);
  const blockchain = blockchainName;

  const extendedCommit: ExtendedCommit = {
    "blockNumber": blockNumber,
    "transactionHash": transactionHash,
    "commit": commit,
    "author": author,
    "committer": committer,
    "provider": provider,
    "action": action,
    "commitCreatedIsoTime": commitCreatedIsoTime,
    "assetTree": assetTree,
    "assetCid": assetCid,
    "license": license,
    "integrity": integrity,
    "assetCreatedIsoTime": assetCreatedIsoTime,
    "blockchain": blockchain,
  };

  return extendedCommit;
}

export async function extendCommits(assetCid, blockchainInfo, fromIndex, toIndex) {
  const commitEvents = await nit.iterateCommitEvents(assetCid, blockchainInfo, fromIndex, toIndex);
  const commitsSummary = await nit.getCommits(commitEvents);
  await nit.showCommits(commitsSummary);
  let extendedCommits = [];
  for (const summary of commitsSummary) {
    const extendedCommit = await extend(summary, nit.blockchainNames[blockchainInfo.chainId])
    extendedCommits.push(extendedCommit);
  }
  return extendedCommits;
}
