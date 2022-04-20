import fs = require("fs");
import os = require("os");

import { expect } from "chai";
import { loadBlockchain, signIntegrityHash } from "../src/nit";

describe("Sign and verify integrity hash", function() {
  const configFilepath = `${os.homedir()}/.nitconfig.json`;
  let config;

  beforeEach(async function () {
    config = JSON.parse(fs.readFileSync(`${configFilepath}`, "utf-8"));
  });

  it("Sign", async function () {
    const blockchain = await loadBlockchain(config);
    const sha256sum = "666c0946c6b3b66847a2db16872be66658ca3a0236c538addbcc96ac47e94908";
    const signature = await signIntegrityHash(sha256sum, blockchain.signer);
    const targetSignature = "0x97254765d10d1aed2d7ce655171a28016d4d10e0b8014ee198d67e2482947ae61fe1204462ca164c1491f418e73e34b255709a9e04ea1d2af88abd295134a7921c";
    console.log(`Signer address: ${blockchain.signer.address}`);
    console.log(`Signature: ${signature}`);
    expect(signature).to.equal(targetSignature);
  });
});