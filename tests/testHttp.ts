/* manual test: yarn run test --timeout 10000 tests/testHttp.ts
 */

import fs = require("fs");
import os = require("os");

import { expect } from "chai";
import * as FormData from "form-data";
import * as stream from "stream";
import * as http from "../src/http";
import * as ipfs from "../src/ipfs";

describe("HTTP Functions", function() {
  const configFilepath = `${os.homedir()}/.nitconfig.json`;
  let config;
  let imageUrl;
  let imageCid;

  beforeEach(async function () {
    config = JSON.parse(fs.readFileSync(`${configFilepath}`, "utf-8"));
    imageUrl = "https://assets.website-files.com/6148548ab244696560ef92dd/614ba33bb06974479683baa0_Numbers.svg";
    imageCid = "bafkreica6gtp7mgqtxcmcj2mwa2fzdd6tq3xuzmsoozrijksagqii7elly";
  });

  it("GET Numbers logo", async function () {
    const url = imageUrl;
    const headers = {};
    const httpResponse = await http.get(url, headers);
    expect(httpResponse.status).to.be.equal(200);
  });

  it("POST Infura IPFS add", async function () {
    const url = "https://ipfs.infura.io:5001/api/v0/add?cid-version=1&pin=false";
    const infuraProjectId = config.infura.projectId;
    const infuraProjectSecret = config.infura.projectSecret;
    const infuraToken = await ipfs.infuraAccessToken(infuraProjectId, infuraProjectSecret);
    const imageData = (await http.get(imageUrl, {})).data;

    let formData = new FormData();
    const fileReadStream = stream.Readable.from(Buffer.from(imageData));
    formData.append("file", fileReadStream);

    const headers = {
      "Authorization": `Basic ${infuraToken}`,
      ...formData.getHeaders(),
    };
    /* Infura IPFS add returns
     * {
     *   "Name": "sample-result.json",
     *   "Hash": "QmSTkR1kkqMuGEeBS49dxVJjgHRMH6cUYa7D3tcHDQ3ea3",
     *   "Size": "2120"
     * }
     */
    const httpResponse = await http.post(url, formData, headers);

    expect(httpResponse.status).to.be.equal(200);
    expect(httpResponse.data.Hash).to.be.equal(imageCid);
  });
});