/* manual test: yarn run mocha -r ts-node/register tests/testNit.ts
 */

import fs = require("fs");
import os = require("os");

import { expect } from "chai";
import * as nit from "../src/nit";

describe("Nit", function() {
  const configFilepath = `${os.homedir()}/.nitconfig.json`;
  let config;
  let imageUrl;
  let imageCid;

  /* Asset Tree of the generative AI example #1
   * https://nftsearch.site/asset-profile?nid=bafkreid4ug5djtm6iq6hptfs337n3k3driqncivegexzpffzlapiaple44
   */
  const gaiAssetTree = {
    "assetCid": "bafkreid4ug5djtm6iq6hptfs337n3k3driqncivegexzpffzlapiaple44",
    "assetSha256": "7ca1ba34cd9e443c77ccb2defeddab638a20d122a4312f9794b9581e803d64e7",
    "encodingFormat": "image/jpeg",
    "assetTimestampCreated": 1683287179,
    "assetCreator": "",
    "license": {
      "name": null,
      "document": null
    },
    "abstract": "",
    "assetSourceType": "captureUpload",
    "creatorWallet": "0x6059DFC1daFb109474aB6fAD87E93A11Bfa5e1D2"
  };

  beforeEach(async function () {
    config = JSON.parse(fs.readFileSync(`${configFilepath}`, "utf-8"));
    imageUrl = "https://assets.website-files.com/6148548ab244696560ef92dd/614ba33bb06974479683baa0_Numbers.svg";
    imageCid = "bafkreica6gtp7mgqtxcmcj2mwa2fzdd6tq3xuzmsoozrijksagqii7elly";
  });

  it(".. should add a valid license successfully", async function () {
    const stagingAssetTree = await nit.createAssetTreeInitialRegister(
      gaiAssetTree.assetCid,
      gaiAssetTree.assetSha256,
      gaiAssetTree.encodingFormat,
      gaiAssetTree.assetTimestampCreated,
      gaiAssetTree.assetCreator,
      "cc-by-nc-nd-4.0",
      gaiAssetTree.abstract
    );

    await expect(stagingAssetTree.license.name).to.be.equal("CC-BY-NC-ND-4.0");
    await expect(stagingAssetTree.license.document).to.be.equal("https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode");
  });

  /* TODO: For the key with null or undefined, should we keep the key or remove it?
   * We remove the key for now.
   */
  it(".. should add an invalid license without breaking program", async function () {
    const stagingAssetTree = await nit.createAssetTreeInitialRegister(
      gaiAssetTree.assetCid,
      gaiAssetTree.assetSha256,
      gaiAssetTree.encodingFormat,
      gaiAssetTree.assetTimestampCreated,
      gaiAssetTree.assetCreator,
      "cc-by-nc-nd-invalid",
      gaiAssetTree.abstract
    );

    await expect(stagingAssetTree.license).to.be.undefined;
  });

  it(".. should add an abstract successfully", async function () {
    gaiAssetTree.abstract = "";

    const stagingAssetTree = await nit.createAssetTreeInitialRegister(
      gaiAssetTree.assetCid,
      gaiAssetTree.assetSha256,
      gaiAssetTree.encodingFormat,
      gaiAssetTree.assetTimestampCreated,
      gaiAssetTree.assetCreator,
      "cc-by-nc-nd-4.0",
      gaiAssetTree.abstract
    );

    await expect(stagingAssetTree.abstract).to.be.equal("");
  });

  /* TODO: For the key with null or undefined, should we keep the key or remove it?
   * We remove the key for now.
   */
  it(".. should add an invalid abstract without breaking program", async function () {
    const stagingAssetTree = await nit.createAssetTreeInitialRegister(
      gaiAssetTree.assetCid,
      gaiAssetTree.assetSha256,
      gaiAssetTree.encodingFormat,
      gaiAssetTree.assetTimestampCreated,
      gaiAssetTree.assetCreator,
      "cc-by-nc-nd-4.0",
      undefined
    );

    await expect(stagingAssetTree.abstract).to.be.undefined;
  });
});