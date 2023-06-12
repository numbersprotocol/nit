/* manual test: yarn run test --timeout 10000 tests/testIpfs.ts
 */

import fs = require("fs");
import os = require("os");

import { expect } from "chai";
import * as http from "../src/http";
import * as ipfs from "../src/ipfs";

describe("IPFS Functions", function() {
  const configFilepath = `${os.homedir()}/.nitconfig.json`;
  let config;
  let imageUrl;
  let imageCid;

  beforeEach(async function () {
    config = JSON.parse(fs.readFileSync(`${configFilepath}`, "utf-8"));
    imageUrl = "https://assets.website-files.com/6148548ab244696560ef92dd/614ba33bb06974479683baa0_Numbers.svg";
    imageCid = "bafkreica6gtp7mgqtxcmcj2mwa2fzdd6tq3xuzmsoozrijksagqii7elly";
  });

  it("Estuary Add", async function () {
    const imageData = (await http.get(imageUrl, {})).data;

    await ipfs.initEstuary(config.estuary.apiKey);
    const cid = await ipfs.estuaryAdd(Buffer.from(imageData));

    expect(cid).to.be.equal(imageCid);
  });
});