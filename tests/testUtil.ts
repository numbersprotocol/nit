/* manual test: yarn run test tests/testUtil.ts
 */

import { expect } from "chai";
import * as util from "../src/util";

describe("Util Functions", function() {
  it("Should merge JSON objects correctly", async function () {
    const json1 = {
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
      "creatorWallet": "0x6059DFC1daFb109474aB6fAD87E93A11Bfa5e1D2"
    }
    const json2 = {
      "assetCid": "bafkreid4ug5djtm6iq6hptfs337n3k3driqncivegexzpffzlapiaple44",
      "assetSha256": "7ca1ba34cd9e443c77ccb2defeddab638a20d122a4312f9794b9581e803d64e7",
      "encodingFormat": "image/jpeg",
      "assetTimestampCreated": 1683287179,
      "assetCreator": "",
      "license": {
        "name": "CC-BY-NC-ND-4.0",
        "document": "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode"
      },
    }
    const json3 = {
      "assetCid": "bafkreid4ug5djtm6iq6hptfs337n3k3driqncivegexzpffzlapiaple44",
      "assetSha256": "7ca1ba34cd9e443c77ccb2defeddab638a20d122a4312f9794b9581e803d64e7",
      "encodingFormat": "image/jpeg",
      "assetTimestampCreated": 1683287179,
      "assetCreator": "",
      "assetSourceType": "captureUpload",
    };

    const mergedJSON = util.mergeJsons([json1, json2, json3]);

    expect(JSON.stringify(mergedJSON)).to.be.equal(JSON.stringify({
      "assetCid": "bafkreid4ug5djtm6iq6hptfs337n3k3driqncivegexzpffzlapiaple44",
      "assetSha256": "7ca1ba34cd9e443c77ccb2defeddab638a20d122a4312f9794b9581e803d64e7",
      "encodingFormat": "image/jpeg",
      "assetTimestampCreated": 1683287179,
      "assetCreator": "",
      "license": {
        "name": "CC-BY-NC-ND-4.0",
        "document": "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode"
      },
      "abstract": "",
      "creatorWallet": "0x6059DFC1daFb109474aB6fAD87E93A11Bfa5e1D2",
      "assetSourceType": "captureUpload",
    }));
  });

  it("Should return an empty object when merged an empty array", async function () {
    const mergedJson = util.mergeJsons([]);

    expect(JSON.stringify(mergedJson)).to.be.equal(JSON.stringify({}))
  });
});
