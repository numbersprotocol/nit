import * as FormData from "form-data";
import * as stream from "stream";
import got from "got";

import * as http from "./http";

let ProjectId = "";
let ProjectSecret = "";

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