import * as FormData from "form-data";
import * as stream from "stream";
import got from "got";
import { Estuary } from "@numbersprotocol/estuary-upload";

import * as http from "./http";

// FIXME: make Nit config to be a module
let ProjectId = "";
let ProjectSecret = "";

let EstuaryInstance;

export async function initInfura(projectId, projectSecret) {
  ProjectId = projectId;
  ProjectSecret = projectSecret;
}

export async function infuraAccessToken(projectId, projectSecret) {
  return Buffer.from(`${projectId}:${projectSecret}`).toString('base64');
}

export async function infuraIpfsAddBytes(bytes) {
  const fileReadStream = stream.Readable.from(bytes);
  const formData = new FormData();
  formData.append('file', fileReadStream);

  const url = "https://ipfs.infura.io:5001/api/v0/add?cid-version=1";
  const authBase64 = Buffer.from(`${ProjectId}:${ProjectSecret}`).toString('base64');
  const headers = {
    "Authorization": `Basic ${authBase64}`,
    ...formData.getHeaders(),
  };
  const httpResponse = await http.post(url, formData, headers);
  const assetCid = httpResponse.data.Hash;
  return assetCid;
}

export async function infuraIpfsCat(cid) {
  const url = `https://ipfs.infura.io:5001/api/v0/cat?arg=${cid}`;
  const authBase64 = Buffer.from(`${ProjectId}:${ProjectSecret}`).toString('base64');
  const requestConfig = {
    "headers": {
      "Authorization": `Basic ${authBase64}`,
    },
    timeout: { request: 30000 },
  }
  /* FIXME: Axios's response.data.lenght is smaller than content length.
   * Use Got as a temporary workardound.
   * https://github.com/axios/axios/issues/3711
   */
  const r = await got.post(url, requestConfig);
  return r.rawBody;
}

export async function cidToJsonString(cid) {
  try {
    const cidContentBytes = await infuraIpfsCat(cid);
    return cidContentBytes.toString();
  } catch(error) {
    console.error(`Failed to download content of CID ${cid}`);
    return null;
  }
}

export async function cidToJson(cid) {
  try {
    const cidContentString = await cidToJsonString(cid);
    return JSON.parse(cidContentString );
  } catch(error) {
    console.error(`Failed to download content of CID ${cid}`);
    return null;
  }
}

export async function initEstuary(apiKey) {
  EstuaryInstance = new Estuary(apiKey);
}

export async function estuaryAdd(bytes) {
  // Kudo CIDv1
  let cid;
  try {
    cid = await EstuaryInstance.addFromBuffer(bytes);
    return cid;
  } catch(error) {
    console.error(error);
  }
}