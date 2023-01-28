import { ethers, utils } from "ethers";

import axios from 'axios';
import FormData = require("form-data");

import * as ipfs from "./ipfs";
import * as nit from "./nit";
import * as util from "./util";

interface ExtendedCommit {
  commitEventIndex;
  blockNumber;
  transactionHash;
  commit;
  assetCid;
  assetTree;
  author;
  authorWalletAddress;
  committer;
  committerWalletAddress;
  provider;
  license;
  action;
  integrity;
  assetCreatedIsoTime: string;
  commitCreatedIsoTime: string;
  blockchain: string;
}

async function extend(commitEventIndex, commitSummary, blockchainName) {
  const blockNumber = commitSummary.blockNumber ;
  const transactionHash = commitSummary.transactionHash;
  const commitObject = commitSummary.commit;
  const commit = JSON.stringify(commitObject);

  const author = await ipfs.cidToJsonString(commitObject.author);
  const authorWalletAddress = JSON.parse(author).wallet;
  const committer = await ipfs.cidToJsonString(commitObject.committer);
  const committerWalletAddress = JSON.parse(committer).wallet;
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
    "commitEventIndex": commitEventIndex,
    "blockNumber": blockNumber,
    "transactionHash": transactionHash,
    "commit": commit,
    "author": author,
    "authorWalletAddress": authorWalletAddress,
    "committer": committer,
    "committerWalletAddress": committerWalletAddress,
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
    const extendedCommit = await extend(assetCid, summary, nit.blockchainNames[blockchainInfo.chainId])
    extendedCommits.push(extendedCommit);
  }
  return extendedCommits;
}

// bubble -> calculate how many items to retrieve -> call update -> push extended commints to db -> return updated entry amount
export async function update(assetCid, blockchainInfo, dbEntryAmount, dbEndpointUrl, accessToken=null) {
  const onchainCommitAmount = (await nit.getCommitBlockNumbers(assetCid, blockchainInfo)).length;
  const updateFromIndex = dbEntryAmount;
  const updateToIndex = onchainCommitAmount;
  const extendedCommits = await extendCommits(assetCid, blockchainInfo, updateFromIndex, updateToIndex);

  for (const extendedCommit of extendedCommits) {
    const r = await httpPost(dbEndpointUrl, extendedCommit, accessToken);
  }

  return {
    "originalDbEntryAmount": parseInt(dbEntryAmount),
    "updateDbEntryAmount": updateToIndex - updateFromIndex,
  };
}

export async function httpPost(url, data, accessToken=null) {
  const formData = new FormData();
  for (const key of Object.keys(data)) {
    formData.append(key, data[key] ? data[key] : "");
  }

  //const authBase64 = Buffer.from(`${ProjectId}:${ProjectSecret}`).toString('base64');
  const requestConfig = {
    "headers": {
      //"Authorization": `Bearer ${authBase64}`,
      ...formData.getHeaders(),
    },
  }
  if (accessToken != null) {
    requestConfig.headers.Authorization = `Bearer ${accessToken}`;
  }
  const r = await axios.post(url, formData, requestConfig);
  const returnedData = r.data;
  return returnedData;
}

export async function push(commitDbUpdateUrl: string, assetCid: string, commitDbCommitUrl: string) {
  const data = {
    "assetCid": assetCid,
    "dbEndpointUrl": commitDbCommitUrl,
  };
  const r = await httpPost(commitDbUpdateUrl, data);
  return r;
}