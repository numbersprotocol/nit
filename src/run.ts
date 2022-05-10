#!/usr/bin/env ts-node

import fs = require("fs");
import os = require("os");

import commandLineArgs = require("command-line-args");
import commandLineUsage = require("command-line-usage");
import mime = require("mime-types");
import sha256 = require("crypto-js/sha256");

import { ethers } from "ethers";

import * as action from "./action";
import * as contract from "./contract";
import * as ipfs from "./ipfs";
import * as license from "./license";
import * as nit from "./nit";

const launch = require("launch-editor");

/*----------------------------------------------------------------------------
 * Configuration
 *----------------------------------------------------------------------------*/
const configFilepath = `${os.homedir()}/.nitconfig.json`;
const workingDir = `.nit`;

async function setWorkingAssetCid(assetCid: string) {
  if (fs.existsSync(`${workingDir}`) === false) {
    console.log(`Create working dir ${workingDir}`);
    fs.mkdirSync(`${workingDir}`);
  } else {
    // working dir exists
  }
  fs.writeFileSync(`${workingDir}/working.json`, JSON.stringify({"assetCid": assetCid}, null, 2));
}

async function getWorkingAssetCid() {
  const workingConfig = JSON.parse(fs.readFileSync(`${workingDir}/working.json`, "utf-8"));
  return workingConfig.assetCid;
}

async function loadConfig() {
  const config = JSON.parse(fs.readFileSync(`${configFilepath}`, "utf-8"));
  return config;
}

async function writeConfig(configData: Object) {
  const nitconfig = `${configFilepath}`;
  if (fs.existsSync(nitconfig) === false) {
    fs.writeFileSync(nitconfig,
                     JSON.stringify(configData, null, 2),
                     { flag: "wx+" });
  } else {
    console.warn(`Nit config ${nitconfig} exists.`);
  }
}

/*----------------------------------------------------------------------------
 * CLI Usage
 *----------------------------------------------------------------------------*/
async function help() {
  const logo = `
    ████████████████████████████████████
    ████████████████████████████████████
    ████████████████████████████████████
    ████████████████████████████████████
    ████████▀▀▀▀▀▀████████▀▀▀▀▀▀████████
    ████████    ▄█▌ ▀████▌      ████████
    ████████  Φ███▌   ▀██▌      ████████
    ████████   ╙▀█▌     ╙▀      ████████
    ████████      L      ▐█▄    ████████
    ████████      ▐█▄    ▐███▄  ████████
    ████████      ▐███▄  ▐██▀   ████████
    ████████      ▐██████▄▀     ████████
    ████████████████████████████████████
    ████████████████████████████████████
    ████████████████████████████████████
    ████████████████████████████████████
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
  `;
  const sections = [
    {
      content: logo,
      raw: true
    },
    {
      header: "Available Commands",
      content: [
        "init      Initialize working environment",
        "config    Edit Nit configuration",
        "add       Add assetTree",
        "status    Show current temporary commit",
        "commit    Generate and register commit to web3",
        "verify    Verify integrity signature",
        "log       Show asset's commits",
        "help      Show this usage tips",
      ]
    },
    {
      header: 'init',
      content: [
        "$ nit init",
      ]
    },
    {
      header: 'config',
      content: [
        "$ nit config -e|--edit",
        "$ nit config -l|--list",
      ]
    },
    {
      header: 'add',
      content: [
        "$ nit add {underline assetTreeFilepath}",
      ]
    },
    {
      header: 'status',
      content: [
        "$ nit status",
      ]
    },
    {
      header: 'commit',
      content: [
        "$ nit commit -m|--message {underline abstract} -a|--action {underline action} -r|--action-result {underline actionResult}",
        "$ nit commit -m|--message {underline abstract} -a|--action {underline action} -r|--action-result {underline actionResult} --dry-run",
        "$ nit commit -m|--message {underline abstract} -a|--action {underline action} -r|--action-result {underline actionResult} --mockup",
        "$ nit commit -m|--message {underline abstract} -a|--action {underline action} -r|--action-result {underline actionResult} -s|--signoff",
      ]
    },
    {
      header: 'commit options',
      optionList: [
        {
          "name": "message",
          "description": 'Discription of this commit. The message will be in the "abstract" field in a Commit.',
          "alias": "m",
          "typeLabel": "{underline commit-description}"
        },
        {
          "name": "action",
          "description": '(Under-development) The action happened on the targeting ditigal asset (addressed by Asset CID). The message will be in the "action" field in a Commit. You can put arbitrary value currently.',
          "alias": "a",
          "typeLabel": "{underline commit-description}"
        },
        {
          "name": "action-result",
          "description": '(Under-development) The execution result of the action. The message will be in the "actionResult" field in a Commit. You can put arbitrary value currently.',
          "alias": "r",
          "typeLabel": "{underline commit-description}"
        },
        {
          "name": "signoff",
          "description": "Sign off the integrity hash of the Asset Tree."
        },
        {
          "name": "dry-run",
          "description": "Only show the Commit content and will not commit to blockchain. The added Asset Tree will not be cleaned."
        },
        {
          "name": "mockup",
          "description": "Use Asset CID mockup (59 'a' chars) as Commit's targeting digital asset."
        },
      ]
    },
    {
      header: 'verify',
      content: [
        "$ nit verify -i|--integrity-hash {underline integrityHash} -s|--signature {underline signature}",
      ]
    },
    {
      header: 'log',
      content: [
        "$ nit log {underline assetCid}",
      ]
    },
  ]
  const usage = commandLineUsage(sections)
  console.log(usage)
}

async function parseArgs() {
  const commandDefinitions = [
    { name: "command", defaultOption: true },
  ];
  const commandOptions = commandLineArgs(commandDefinitions,
                                         { stopAtFirstUnknown: true });
  const argv = commandOptions._unknown || [];

  if (commandOptions.command === "ipfsadd") {
    const paramDefinitions = [
      { name: "filepath", defaultOption: true },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "ipfsadd",
      "params": {
        "fileapth": paramOptions.filepath,
      }
    }
  } else if (commandOptions.command === "init") {
    return {
      "command": "init",
      "params": {}
    }
  } else if (commandOptions.command === "add") {
    const paramDefinitions = [
      { name: "filepath", defaultOption: true },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "add",
      "params": {
        "filepath": paramOptions.filepath,
      }
    };
  } else if (commandOptions.command === "addv2") {
    const paramDefinitions = [
      { name: "filepath", defaultOption: true },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "addv2",
      "params": {
        "filepath": paramOptions.filepath,
      }
    };
  } else if (commandOptions.command === "commit") {
    const paramDefinitions = [
      { name: "signoff", alias: "s" },
      { name: "message", alias: "m" },
      { name: "action", alias: "a" },
      { name: "action-result", alias: "r" },
      { name: "dry-run"},
      { name: "mockup"},
    ];
    const paramOptions = commandLineArgs(paramDefinitions, { argv });
    return {
      "command": "commit",
      "params": paramOptions
    }
  } else if (commandOptions.command === "mcommit") {
    const paramDefinitions = [
      { name: "asset-cid" },
      { name: "commit-filepath" },
    ];
    const paramOptions = commandLineArgs(paramDefinitions, { argv });
    return {
      "command": "mcommit",
      "params": paramOptions
    }
  } else if (commandOptions.command === "status") {
    return {
      "command": "status",
      "params": {}
    }
  } else if (commandOptions.command === "verify") {
    const paramDefinitions = [
      { name: "integrity-hash", alias: "i" },
      { name: "signature", alias: "s" },
    ];
    const paramOptions = commandLineArgs(paramDefinitions, { argv });
    return {
      "command": "verify",
      "params": paramOptions
    }
  } else if (commandOptions.command === "log") {
    const paramDefinitions = [
      { name: "asset-cid", defaultOption: true },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "log",
      "params": {
        "asset-cid": paramOptions["asset-cid"],
      }
    }
  } else if (commandOptions.command === "config") {
    const paramDefinitions = [
      { name: "edit", alias: "e" },
      { name: "list", alias: "l" },
    ];
    const paramOptions = commandLineArgs(paramDefinitions, { argv });
    return {
      "command": "config",
      "params": paramOptions
    }
  } else {
    return {
      "command": "help",
      "params": {}
    }
  }
}

async function main() {
  const args = await parseArgs();

  if (args.command === "init") {
    await writeConfig(nit.nitconfigTemplate);
    await setWorkingAssetCid("");
    console.log('You can run "nit config -e" to set configuration now.');
    return
  } else if (fs.existsSync(configFilepath) === false) {
    console.log('Please run "nit init" to create config.');
    return
  } else {
    // config exists
  }

  const config = await loadConfig();
  const blockchain = await nit.loadBlockchain(config, contract.abi);

  await ipfs.initInfura(config.infura.projectId, config.infura.projectSecret);

  if (args.command === "ipfsadd") {
    const r = await ipfs.infuraIpfsAdd(args.params.fileapth);
    console.log(`Command ipfsadd result: ${JSON.stringify(r, null, 2)}`);
  } else if (args.command === "add") {
    const assetTreeFileContent = fs.readFileSync(args.params.filepath, "utf-8");
    const assetTree = JSON.parse(assetTreeFileContent);
    console.log(`Add assetTree: ${JSON.stringify(assetTree, null, 2)}\n`);

    // Create commit dir whose name is assetCid
    const commitDir = `${workingDir}/${assetTree.assetCid}`;
    if (fs.existsSync(commitDir) === false) {
      fs.mkdirSync(commitDir);
    } else {}

    // Check and set up license
    if (config.license == "custom") {
      assetTree.license = JSON.parse(config.licenseContent);
    } else {
      assetTree.license = license.Licenses[config.license];
    }

    // Create staged assetTree file
    console.log(`Current assetTree: ${JSON.stringify(assetTree, null, 2)}\n`);
    fs.writeFileSync(`${commitDir}/assetTree.json`, JSON.stringify(assetTree, null, 2));

    // Get assetTreeCid and encodingFormat
    const assetTreeInfo = await ipfs.infuraIpfsAdd(`${commitDir}/assetTree.json`);

    // Get assetTreeSha256
    const assetTreeSha256 = sha256(assetTreeFileContent);

    const commit = {
      "assetTreeCid": assetTreeInfo.assetCid,
      "assetTreeSha256": assetTreeSha256.toString(),
      "assetTreeSignature": await nit.signIntegrityHash(
                              assetTreeSha256.toString(), blockchain.signer),
      "author": config.author,
      "committer": config.committer,
      "action": action.Actions["action-initial-registration"],
      "actionResult": `https://${assetTreeInfo.assetCid}.ipfs.dweb.link`,
      "provider": config.provider,
      "abstract": "Initial registration.",
      "timestampCreated": Math.floor(Date.now() / 1000),
    }
    console.log(`Create temporary commit: ${JSON.stringify(commit, null, 2)}\n`);
    fs.writeFileSync(`${commitDir}/commit.json`, JSON.stringify(commit, null, 2));

    // Update current target assetCid
    await setWorkingAssetCid(assetTree.assetCid);
  } else if (args.command === "addv2") {
    // Create staged AssetTree
    const assetBytes = fs.readFileSync(args.params.filepath);
    const assetMimetype = mime.lookup(args.params.filepath);
    const assetBirthtime = Math.floor(fs.statSync(args.params.filepath).birthtimeMs / 1000);
    let assetTree = await nit.createAssetTreeInitialRegister(assetBytes,
                                                             assetMimetype,
                                                             assetBirthtime,
                                                             config.author,
                                                             config.license);
    console.log(`Add assetTree: ${JSON.stringify(assetTree, null, 2)}\n`);

    // Check and set up license
    if (config.license == "custom") {
      assetTree.license = JSON.parse(config.licenseContent);
    } else {
      assetTree.license = license.Licenses[config.license];
    }

    console.log(`Current AssetTree: ${JSON.stringify(assetTree, null, 2)}\n`);

    // Create staged Commit
    const commit = await nit.createCommitInitialRegister(blockchain.signer, config.author, config.committer, config.provider);

    console.log(`Current Commit: ${JSON.stringify(commit, null, 2)}\n`);
  } else if (args.command === "commit") {
    if (await getWorkingAssetCid() === "") {
      console.log("Need to add an assetTree before commit");
      return;
    } else {
      // there is a working asset
    }

    const assetCid = await getWorkingAssetCid();
    let commitData = JSON.parse(fs.readFileSync(`${workingDir}/${assetCid}/commit.json`, "utf-8"));

    // Add commit.assetTreeSignature
    if ("signoff" in args.params) {
      commitData.assetTreeSignature = await nit.signIntegrityHash(commitData.assetTreeSha256,
                                                                  blockchain.signer);
    } else {
      console.log(`Commit message: not found and will force user to provide soon`);
    }
    // Add commit.abstract
    if ("message" in args.params) {
      commitData.abstract = args.params["message"];
    } else {
      console.log(`Commit message: not found and will force user to provide soon`);
    }
    // Add commit.action
    if ("action" in args.params) {
      commitData.action = JSON.parse(args.params["action"]);
    } else {
      console.log(`Commit action: initial registration (default action)`);
    }
    // Add commit.actionResult
    if ("action-result" in args.params) {
      commitData.actionResult = JSON.parse(args.params["action-result"]);
    } else {
      console.log(`Commit actionResult: initial registration result (default action result)`);
    }
    // Update commit.timestampCreated
    commitData.timestampCreated = Math.floor(Date.now() / 1000);

    console.log(`Asset Cid (index): ${assetCid}`);
    console.log(`Commit: ${JSON.stringify(commitData, null, 2)}`);

    if ("dry-run" in args.params === false) {
      console.debug(`Committing...`);
      console.log([
        "Contract Information",
        `Signer wallet address: ${blockchain.signer.address}`,
        `Contract address: ${blockchain.contract.address}`,
      ]);

      let commitResult;
      if ("mockup" in args.params === false) {
        commitResult = await nit.commit(assetCid, JSON.stringify(commitData), blockchain);
      } else {
        const assetCidMock = "a".repeat(nit.cidv1Length);
        commitResult = await nit.commit(assetCidMock, JSON.stringify(commitData), blockchain);
      }

      console.log(`Commit Tx: ${commitResult.hash}`);
      console.log(`Commit Explorer: ${blockchain.explorerBaseUrl}/${commitResult.hash}`);

      // Reset workingAssetCid because commit has been completed.
      await setWorkingAssetCid("");
    } else {
      console.log("This is dry run and Nit does not register this commit to blockchain.");
    }
  } else if (args.command === "mcommit") {
    // TODO: add + commit
  } else if (args.command === "status") {
    const workingAssetCid = await getWorkingAssetCid();
    if (workingAssetCid !== "") {
      const commitData = JSON.parse(fs.readFileSync(`${workingDir}/${workingAssetCid}/commit.json`, "utf-8"));
      const assetTree = JSON.parse(fs.readFileSync(`${workingDir}/${workingAssetCid}/assetTree.json`, "utf-8"));
      console.log(`[ Working Asset CID ]\n${workingAssetCid}\n`);
      console.log(`[ Staging Commit ]\n${JSON.stringify(commitData, null, 2)}\n`);
      console.log(`[ Asset Tree ]\n${JSON.stringify(assetTree, null, 2)}\n`);
    } else {
      console.log("No working Asset");
    }
  } else if (args.command === "verify") {
    const integrityHash = args.params["integrity-hash"];
    const signature = args.params.signature;
    const signerAddress = await nit.verifyIntegrityHash(integrityHash, signature);
    console.log(`Signer address: ${signerAddress}`);
  } else if (args.command === "log") {
    if ("asset-cid" in args.params) {
      await nit.log(args.params["asset-cid"], blockchain);
    } else {
      await help();
    }
  } else if (args.command === "config") {
    if ("edit" in args.params) {
      await launch(`${configFilepath}`);
    } else if ("list" in args.params) {
      console.log(JSON.stringify(config, null, 2));
    } else {
      await help();
    }
  } else {
    await help();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });