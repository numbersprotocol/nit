import axios from 'axios';
import FormData = require("form-data");
import fs = require("fs");
import got from "got";
import mime = require("mime-types");

let ProjectId = "";
let ProjectSecret = "";

export async function initInfura(projectId, projectSecret) {
  ProjectId = projectId;
  ProjectId = projectSecret;
}

export async function infuraIpfsAdd(filePath: string) {
  const contentBytes = fs.readFileSync(filePath);
  const encodingFormat = mime.lookup(filePath);
  return await infuraIpfsAddBytes(contentBytes, encodingFormat);
}

export async function infuraIpfsAddBytes(bytes, mimeType) {
  const { Readable } = require("stream");
  const fileReadStream = Readable.from(bytes);

  const formData = new FormData();
  formData.append('file', fileReadStream);

  const url = "https://ipfs.infura.io:5001/api/v0/add?cid-version=1";
  const authBase64 = Buffer.from(`${ProjectId}:${ProjectSecret}`).toString('base64');
  const requestConfig = {
    "headers": {
      "Authorization": `Bearer ${authBase64}`,
      ...formData.getHeaders(),
    },
  }
  const r = await axios.post(url, formData, requestConfig);
  const assetCid = r.data.Hash;

  return {
    "assetCid": assetCid,
    "encodingFormat": mimeType
  }
}

export async function infuraIpfsCat(cid) {
  const url = `https://ipfs.infura.io:5001/api/v0/cat?arg=${cid}`;
  const authBase64 = Buffer.from(`${ProjectId}:${ProjectSecret}`).toString('base64');
  const requestConfig = {
    "headers": {
      "Authorization": `Bearer ${authBase64}`,
    },
    timeout: { request: 30000 },
  }
  const r = await got.post(url, requestConfig);
  return r.rawBody;
}
