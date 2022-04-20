import axios from 'axios';
import FormData = require("form-data");
import fs = require("fs");
import mime = require("mime-types");

let ProjectId = "";
let ProjectSecret = "";

export async function initInfura(projectId, projectSecret) {
  ProjectId = projectId;
  ProjectId = projectSecret;
}

export async function infuraIpfsAdd(filePath: string) {
  const fileReadStream = fs.createReadStream(filePath);  // returns: fs.ReadStream
  const encodingFormat = mime.lookup(filePath);

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
    "encodingFormat": encodingFormat
  }
}