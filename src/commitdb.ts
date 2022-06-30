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
  const commit = commitSummary.commit;

  const author = await ipfs.cidToJson(commit.author);
  const committer = await ipfs.cidToJson(commit.committer);
  const provider = await ipfs.cidToJson(commit.provider);
  const action = await ipfs.cidToJson(commit.action);
  const commitCreatedIsoTime = util.timestampToIsoString(commit.timestampCreated);
  const assetTree = await ipfs.cidToJson(commit.assetTreeCid);
  const assetCid = assetTree.assetCid;
  const license = await ipfs.cidToJson(assetTree.provider);
  const integrity = await ipfs.cidToJson(assetTree.integrityCid);
  const assetCreatedIsoTime = util.timestampToIsoString(assetTree.assetTimestampCreated);
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
