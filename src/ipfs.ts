import * as FormData from "form-data";
import * as stream from "stream";
import got from "got";
import { Estuary } from "@numbersprotocol/estuary-upload";

import * as http from "./http";

// FIXME: make Nit config to be a module
let ProjectId = "";
let ProjectSecret = "";

let EstuaryInstance;
let NumbersProtocolCaptureToken = ""; // Store the Capture Token
let NumbersProtocolIpfsGatewayLambda = "https://mjacdgxzla.execute-api.us-east-1.amazonaws.com/default/ipfs-add-with-payment";
let NumbersProtocolIpfsGateway = "https://ipfs-pin.numbersprotocol.io/ipfs";

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

export async function w3sIpfsCat(cid) {
  const url = `https://${cid}.ipfs.w3s.link`;
  const requestConfig = {
    timeout: { request: 30000 },
  }
  /* FIXME: Axios's response.data.lenght is smaller than content length.
   * Use Got as a temporary workardound.
   * https://github.com/axios/axios/issues/3711
   */
  const r = await got.get(url, requestConfig);
  return r.rawBody;
}

export async function ipfsAddBytes(bytes) {
  return await numbersProtocolIpfsAddBytes(bytes);
}

export async function ipfsCat(cid) {
  return await numbersProtocolIpfsCat(cid);
}

export async function cidToJsonString(cid) {
  try {
    const cidContentBytes = await ipfsCat(cid);
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

// Update this function to accept and store the Capture Token
export async function initNumbersProtocol(captureToken) {
  NumbersProtocolCaptureToken = captureToken;
}

export async function numbersProtocolIpfsAddBytes(bytes) {
  try {
    // Create form data with the file
    const fileReadStream = stream.Readable.from(bytes);
    const formData = new FormData();
    formData.append('file', fileReadStream);

    // Use Numbers Protocol IPFS add API endpoint with Capture Token in header
    const url = NumbersProtocolIpfsGatewayLambda;
    const headers = {
      "Authorization": `token ${NumbersProtocolCaptureToken}`,
      ...formData.getHeaders(),
    };
    
    const httpResponse = await http.post(url, formData, headers);
    const assetCid = httpResponse.data.cid;
    return assetCid;
  } catch(error) {
    console.error("Error adding to Numbers Protocol IPFS:", error);
    throw error;
  }
}

export async function numbersProtocolIpfsCat(cid) {
  try {
    // Use Numbers Protocol IPFS cat API endpoint with Capture Token
    const url = `${NumbersProtocolIpfsGateway}/${cid}`;
    const requestConfig = {
      headers: {
        "Authorization": `token ${NumbersProtocolCaptureToken}`
      },
      timeout: { request: 30000 },
    };
    
    const r = await got.get(url, requestConfig);
    return r.rawBody;
  } catch(error) {
    console.error(`Failed to download content of CID ${cid} from Numbers Protocol IPFS:`, error);
    throw error;
  }
}

// Add new function to unpin content from Numbers Protocol IPFS with Capture Token
export async function numbersProtocolIpfsUnpin(cid) {
  try {
    // Use Numbers Protocol IPFS unpin API endpoint with Capture Token
    const url = NumbersProtocolIpfsGatewayLambda;
    const requestConfig = {
      headers: {
        "Authorization": `token ${NumbersProtocolCaptureToken}`
      },
      timeout: { request: 30000 },
    };
    
    const r = await got.delete(url, requestConfig);
    return r.statusCode === 200;
  } catch(error) {
    console.error(`Failed to unpin CID ${cid} from Numbers Protocol IPFS:`, error);
    return false;
  }
}
