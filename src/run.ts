#!/usr/bin/env ts-node

import fs = require("fs");
import os = require("os");

import commandLineArgs = require("command-line-args");
import commandLineUsage = require("command-line-usage");
import mime = require("mime-types");
import sha256 = require("crypto-js/sha256");

import got from "got";
import * as colors from "colors";

import * as action from "./action";
import * as commitdb from "./commitdb";
import * as ipfs from "./ipfs";
import * as license from "./license";
import * as nit from "./nit";

const launch = require("launch-editor");

colors.enable();

/*----------------------------------------------------------------------------
 * Configuration
 *----------------------------------------------------------------------------*/
const configFilepath = `${os.homedir()}/.nitconfig.json`;
const workingDir = `.nit`;

async function setWorkingAssetCid(assetCid: string) {
  if (fs.existsSync(`${workingDir}`) === false) {
    console.log(`Create working dir ${workingDir}`);
    fs.mkdirSync(`${workingDir}`, { recursive: true });
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
 * I/O
 *----------------------------------------------------------------------------*/
async function stage(assetCid, stagedAssetTree, stagedCommit) {
  // Create staged dir whose name is assetCid
  const commitDir = `${workingDir}/${assetCid}`;
  if (fs.existsSync(commitDir) === false) {
    fs.mkdirSync(commitDir, { recursive: true });
  } else {}

  fs.writeFileSync(`${commitDir}/assetTree.json`, JSON.stringify(stagedAssetTree, null, 2));
  fs.writeFileSync(`${commitDir}/commit.json`, JSON.stringify(stagedCommit, null, 2));
  await setWorkingAssetCid(assetCid);
}

async function getStagedCommit(assetCid) {
  return JSON.parse(fs.readFileSync(`${workingDir}/${assetCid}/commit.json`, "utf-8"));
}

async function getStagedAssetTree(assetCid) {
  return JSON.parse(fs.readFileSync(`${workingDir}/${assetCid}/assetTree.json`, "utf-8"));
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
        "sign      Create integrity signature",
        "verify    Verify integrity signature",
        "log       Show asset's commits",
        "diff      Show diff between two commits",
        "merge     Show merged assetTree",
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
        "$ nit add {underline assetFilepath} -m|--message {underline abstract}",
        "$ nit add {underline assetFilepath} -m|--message {underline abstract} --nft-record-cid {underline cid}",
        "$ nit add {underline assetFilepath} -m|--message {underline abstract} --integrity-cid {underline cid}",
        "$ nit add {underline assetFilepath} -m|--message {underline abstract} --license mit",
        "$ nit add {underline assetFilepath} -m|--message {underline abstract} --custom-license {underline license-json}",
        "$ nit add {underline assetFilepath} -m|--message {underline abstract} --nft-record-cid {underline cid} --integrity-cid {underline cid}",
        "$ nit add {underline assetFilepath} -m|--message {underline abstract} --nft-record-cid {underline cid} --integrity-cid {underline cid} --license mit",
      ]
    },
    {
      header: 'addv1',
      content: [
        "$ nit addv1 {underline assetTreeFilepath}",
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
      header: 'sign',
      content: [
        "$ nit sign -i|--integrity-hash {underline integrityHash}",
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
        "$ nit log {underline assetCid} --blocks",
        "$ nit log {underline assetCid} --from-index|-f {underline blockNumberIndex}",
        "$ nit log {underline assetCid} --from-index|-f {underline blockNumberIndex} --to-index|-t {underline blockNumberIndex}",
      ]
    },
    {
      header: 'log options',
      optionList: [
        {
          "name": "blocks",
          "description": 'Return block numbers of Commits and their indices in the block number array.',
          "alias": "b",
          "typeLabel": "{underline bool}",
        },
        {
          "name": "from-index",
          "description": 'Get log starting from the block number related to this index. Range: [from, to)',
          "alias": "f",
          "typeLabel": "{underline blockNumberIndex}",
        },
        {
          "name": "to-index",
          "description": 'Get log ending before the block number related to this index. Range: [from, to)',
          "alias": "t",
          "typeLabel": "{underline blockNumberIndex}",
        },
      ]
    },
    {
      header: 'diff',
      content: [
        "$ nit diff {underline assetCid}",
        "$ nit diff {underline assetCid} --from|-f {underline blockNumberIndex}",
        "$ nit diff {underline assetCid} --from|-f {underline blockNumberIndex} --to|-t {underline blockNumberIndex}",
      ]
    },
    {
      header: "merge",
      content: [
        "$ nit merge {underline assetCid}",
        "$ nit merge {underline assetCid} --from-index|-f {underline blockNumberIndex}",
        "$ nit merge {underline assetCid} --from-index|-f {underline blockNumberIndex} --to-index|-t {underline blockNumberIndex}",
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
  } else if (commandOptions.command === "addv1") {
    const paramDefinitions = [
      { name: "filepath", defaultOption: true },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "addv1",
      "params": {
        "filepath": paramOptions.filepath,
      }
    };
  } else if (commandOptions.command === "add") {
    const paramDefinitions = [
      { name: "filepath", defaultOption: true },
      { name: "message", alias: "m" },
      { name: "nft-record-cid" },
      { name: "integrity-cid" },
      // FIXME: Support default license when latest Asset Tree
      //        and staging Asset Tree comparison is ready.
      //{ name: "license", defaultValue: license.DefaultLicense },
      { name: "license" },
      { name: "custom-license" },
      { name: "update", alias: "u" },
      { name: "mockup" },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": commandOptions.command,
      "params": paramOptions
    };
  } else if (commandOptions.command === "commit") {
    const paramDefinitions = [
      { name: "message", alias: "m" },
      { name: "action", alias: "a" },
      { name: "action-result", alias: "r" },
      { name: "dry-run" },
      { name: "mockup" },
    ];
    const paramOptions = commandLineArgs(paramDefinitions, { argv });
    return {
      "command": commandOptions.command,
      "params": paramOptions
    }
  } else if (commandOptions.command === "status") {
    return {
      "command": "status",
      "params": {}
    }
  } else if (commandOptions.command === "sign") {
    const paramDefinitions = [
      { name: "integrity-hash", alias: "i", defaultValue: "" },
      { name: "filepath", alias: "f", defaultValue: "" },
    ];
    const paramOptions = commandLineArgs(paramDefinitions, { argv });
    return {
      "command": "sign",
      "params": paramOptions
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
      { name: "blocks", alias: "b" },
      { name: "from-index", alias: "f", defaultValue: 0 },
      { name: "to-index", alias: "t", defaultValue: -1 },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "log",
      "params": paramOptions
    }
  } else if (commandOptions.command === "diff") {
    const paramDefinitions = [
      { name: "asset-cid", defaultOption: true },
      { name: "from-index", alias: "f", defaultValue: null },
      { name: "to-index", alias: "t", defaultValue: null },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "diff",
      "params": paramOptions
    }
  } else if (commandOptions.command === "merge") {
    const paramDefinitions = [
      { name: "asset-cid", defaultOption: true },
      { name: "from-index", alias: "f", defaultValue: 0 },
      { name: "to-index", alias: "t", defaultValue: -1 },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": "merge",
      "params": paramOptions
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
  } else if (commandOptions.command === "commitdb") {
    const paramDefinitions = [
      { name: "asset-cid", defaultOption: true },
    ];
    const paramOptions = commandLineArgs(paramDefinitions,
                                         { argv, stopAtFirstUnknown: true });
    return {
      "command": commandOptions.command,
      "params": paramOptions
    };
  } else {
    return {
      "command": "help",
      "params": {}
    }
  }
}

async function assetSourceToBytes(source) {
  console.log("call assetSourceToBytes");
  let assetBytes;
  if (source.substring(0, 4) === "bafy") {
    console.log("source cid");
    assetBytes = await ipfs.ipfsCat(source);
  } else if (source.substring(0, 4) === "http") {
    console.log("source http");
    assetBytes = (await got.get(source, { timeout: { request: 30000 } })).rawBody;
  } else {
    console.log("source filepath");
    assetBytes = fs.readFileSync(source);
  }
  console.log(`${assetBytes.length}`);
  return assetBytes;
}

async function getMimetypeFromBytes(bytes) {
  /* The mime-types module relies on filename extension,
   * so saving a temporary file will not work, and the MimeType
   * will be "false".
   *
   * To get MimeType based on the magic number in a file,
   * file-type module might be a solution.
   *
   * The problem is that file-type only supports ES-Module currently.
   * https://github.com/sindresorhus/file-type/issues/525
   */
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
  const blockchain = await nit.loadBlockchain(config);

  await ipfs.initInfura(config.infura.projectId, config.infura.projectSecret);
  await ipfs.initIpfsCat(config.ipfsCat);

  if (args.command === "ipfsadd") {
    const contentBytes = fs.readFileSync(args.params.fileapth);
    const assetCid = await ipfs.ipfsAddBytes(contentBytes);
    console.log(`Command ipfsadd result (Asset CID): ${assetCid}`);
  } else if (args.command === "addv1") {
    const assetTreeFileContent = fs.readFileSync(args.params.filepath, "utf-8");
    const assetTree = JSON.parse(assetTreeFileContent);
    console.log(`Add assetTree: ${JSON.stringify(assetTree, null, 2)}\n`);

    // Create commit dir whose name is assetCid
    const commitDir = `${workingDir}/${assetTree.assetCid}`;
    if (fs.existsSync(commitDir) === false) {
      fs.mkdirSync(commitDir, { recursive: true });
    } else {}

    // Create staged assetTree file
    console.log(`Current assetTree: ${JSON.stringify(assetTree, null, 2)}\n`);
    fs.writeFileSync(`${commitDir}/assetTree.json`, JSON.stringify(assetTree, null, 2));

    // Get assetTreeCid and encodingFormat
    const contentBytes = fs.readFileSync(`${commitDir}/assetTree.json`);
    const assetCid= await ipfs.ipfsAddBytes(contentBytes);

    // Get assetTreeSha256
    const assetTreeSha256 = sha256(assetTreeFileContent);

    const commit = {
      "assetTreeCid": assetCid,
      "assetTreeSha256": assetTreeSha256.toString(),
      "assetTreeSignature": await nit.signIntegrityHash(
                              assetTreeSha256.toString(), blockchain.signer),
      "author": config.author,
      "committer": config.committer,
      "action": action.Actions["action-initial-registration"],
      "actionResult": `https://${assetCid}.ipfs.dweb.link`,
      "provider": config.provider,
      "abstract": "Initial registration.",
      "timestampCreated": Math.floor(Date.now() / 1000),
    }
    console.log(`Create temporary commit: ${JSON.stringify(commit, null, 2)}\n`);
    fs.writeFileSync(`${commitDir}/commit.json`, JSON.stringify(commit, null, 2));

    // Update current target assetCid
    await setWorkingAssetCid(assetTree.assetCid);
  } else if (args.command === "add") {
    // Create staged AssetTree
    const assetBytes = fs.readFileSync(args.params.filepath);
    //const assetBytes = await assetSourceToBytes(args.params.filepath);

    let assetCid;
    if ("mockup" in args.params === false) {
      assetCid = await ipfs.ipfsAddBytes(assetBytes);
    } else {
      assetCid = "a".repeat(nit.cidv1Length);
    }
    let assetTree = await nit.pull(assetCid, blockchain);
    if (assetTree === null) {
      const assetMimetype = mime.lookup(args.params.filepath);
      const assetBirthtime = Math.floor(fs.statSync(args.params.filepath).birthtimeMs / 1000);
      //const assetMimetype = await getMimetypeFromBytes(assetBytes);
      //const assetBirthtime = Math.floor(Date.now() / 1000);

      assetTree = await nit.createAssetTreeInitialRegisterRemote(assetBytes,
                                                                 assetMimetype,
                                                                 assetBirthtime,
                                                                 config.author);
      console.log("Asset Tree is from initial registration\n");
    } else {
      console.log("Asset Tree is from latest commit\n");
    }

    /* Create Asset Tree updates */
    let assetTreeUpdates: any = {};
    if ("update" in args.params) {
        assetTreeUpdates = JSON.parse(args.params.update);
    } else {
        if ("message" in args.params) {
          assetTreeUpdates.abstract = args.params["message"];
        }
        if ("nft-record-cid" in args.params) {
          assetTreeUpdates.nftRecord = args.params["nft-record-cid"];
        }
        if ("integrity-cid" in args.params) {
          assetTreeUpdates.integrityCid= args.params["integrity-cid"];
        }
        if (license.isSupportedLicense(args.params.license)) {
          assetTreeUpdates.license = license.Licenses[args.params.license];
        } else {
          console.error(`Get unsupported or default license: ${args.params.license}\n`);
        }
        // Custom license will override default or specified license
        if ("custom-license" in args.params) {
          assetTreeUpdates.license = JSON.parse(args.params["custom-license"]);
        }
    }
    console.log(`Current Asset Tree: ${JSON.stringify(assetTree, null, 2)}\n`);
    console.log(`Current Asset Tree Updates: ${JSON.stringify(assetTreeUpdates, null, 2)}\n`);

    /* Create staged Asset Tree & staged Commit if there is any Asset Tree update */
    if (Object.keys(assetTreeUpdates).length > 0) {
      const updatedAssetTree = await nit.updateAssetTree(assetTree, assetTreeUpdates);
      console.log(`Updated Asset Tree: ${JSON.stringify(updatedAssetTree, null, 2)}\n`);
      console.log(`Original Asset Tree: ${JSON.stringify(assetTree, null, 2)}\n`);

      const commit = await nit.createCommit(blockchain.signer, updatedAssetTree, config.author, config.provider);
      console.log(`Current Commit: ${JSON.stringify(commit, null, 2)}\n`);

      // Stage
      await stage(updatedAssetTree.assetCid, updatedAssetTree, commit);
    } else {
      console.error("No update and skip this command");
    }
  } else if (args.command === "commit") {
    const assetCid = await getWorkingAssetCid();

    if (await getWorkingAssetCid() === "") {
      console.log("Need to add an Asset before commit");
      return;
    } else {
      // there is a working asset
    }

    let commitData = await getStagedCommit(assetCid);

    if ("message" in args.params) {
      commitData.abstract = args.params["message"];
    }
    if ("action" in args.params) {
      commitData.action = action.Actions[args.params["action"]];
    }
    if ("action-result" in args.params) {
      commitData.actionResult = args.params["action-result"];
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

      let commitEventIndexCid;
      if ("mockup" in args.params === false) {
        commitEventIndexCid = assetCid;
      } else {
        commitEventIndexCid = nit.assetCidMock;
      }

      try {
        const transactionReceipt = await nit.commit(commitEventIndexCid, JSON.stringify(commitData), blockchain);
        console.log(`Commit Tx: ${transactionReceipt.transactionHash}`);
        console.log(`Commit Explorer: ${blockchain.explorerBaseUrl}/${transactionReceipt.transactionHash}`);
      } catch (error) {
        console.error(`Transaction error: ${error}`);
      }

      // Reset stage
      await setWorkingAssetCid("");

      // Sync Commit Database
      if (config.commitDatabase.updateUrl.length > 0 && config.commitDatabase.commitUrl.length > 0) {
        // TODO: Asking Commit DB to sync
        //const updateCommitDbResult = await commitdb.push(config.commitDatabase.updateUrl, commitEventIndexCid, config.commitDatabase.commitUrl);
        //console.log(`Commit Database update: ${JSON.stringify(updateCommitDbResult, null, 2)}`);
      } else {
        // User does not set up Commit Database.
      }
    } else {
      console.log("This is dry run and Nit does not register this commit to blockchain.");
    }
  } else if (args.command === "status") {
    const workingAssetCid = await getWorkingAssetCid();
    if (workingAssetCid !== "") {
      const commitData = await getStagedCommit(workingAssetCid);
      const assetTree = await getStagedAssetTree(workingAssetCid);
      console.log(`[ Working Asset CID ]\n${workingAssetCid}\n`);
      console.log(`[ Staged Commit ]\n${JSON.stringify(commitData, null, 2)}\n`);
      console.log(`[ Staged AssetTree ]\n${JSON.stringify(assetTree, null, 2)}\n`);
    } else {
      console.log("No working Asset");
    }
  } else if (args.command === "sign") {
    const filepath = args.params.filepath;
    let integrityHash: string = args.params["integrity-hash"];

    if (filepath !== "" && integrityHash !== "") {
      console.error("Signing target should be one of asset or integrity hash. You provide them both.");
      return;
    }

    if (filepath !== "") {
      if (fs.existsSync(filepath)) {
        const assetBytes = fs.readFileSync(filepath);
        integrityHash = await nit.getIntegrityHash(assetBytes);
      } else {
        console.error(`File does not exist: ${filepath}`);
        return;
      }
    } else {
      if (integrityHash === "") {
        await help();
      }

      if (integrityHash.length != nit.integrityHashLength) {
        console.error(`Invalid integrity hash, length is ${integrityHash.length} but not 64.`);
        return;
      }
    }

    const signature = await nit.signIntegrityHash(integrityHash, blockchain.signer);
    console.log(`Signature: ${signature}`);
  } else if (args.command === "verify") {
    const integrityHash = args.params["integrity-hash"];
    const signature = args.params.signature;
    const signerAddress = await nit.verifyIntegrityHash(integrityHash, signature);
    console.log(`Signer address: ${signerAddress}`);
  } else if (args.command === "log") {
    if ("asset-cid" in args.params) {
      const commitBlockNumbers = await nit.getCommitBlockNumbers(args.params["asset-cid"], blockchain);
      console.log(`Total Commit number: ${colors.cyan(commitBlockNumbers.length)}`);
      if ("blocks" in args.params) {
        commitBlockNumbers.map((number, index) => { console.log(`Index: ${index}, Block number: ${number}`); });
        //console.log(`${JSON.stringify(commitBlockNumbers)}`);
      } else {
        await nit.log(args.params["asset-cid"], blockchain, parseInt(args.params["from-index"]), parseInt(args.params["to-index"]));
      }
    } else {
      await help();
    }
  } else if (args.command === "diff") {
    if ("asset-cid" in args.params) {
      const diff = await nit.difference(args.params["asset-cid"], blockchain, args.params["from-index"], args.params["to-index"]);
      console.log(`from: block ${diff.fromBlockNumber}, tx ${diff.fromTransactionHash}`);
      console.log(`  to: block ${diff.toBlockNumber}, tx ${diff.toTransactionHash}`);

      console.log("\nCommit difference");
      await nit.showCommmitDiff(diff.commitDiff);

      console.log("\nAsset Tree difference");
      await nit.showCommmitDiff(diff.assetTreeDiff);
    } else {
      await help();
    }
  } else if (args.command === "merge") {
    if ("asset-cid" in args.params) {
      const result = await nit.merge(args.params["asset-cid"], blockchain, args.params["from-index"], args.params["to-index"]);
      console.log(`from: block ${result.fromBlockNumber}, tx ${result.fromTransactionHash}`);
      console.log(`  to: block ${result.toBlockNumber}, tx ${result.toTransactionHash}`);

      console.log("\nCommit merge");
      console.log(JSON.stringify(result.commitMerge, null, 2));

      console.log("\nAsset Tree merge");
      console.log(JSON.stringify(result.assetTreeMerge, null, 2));
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
  } else if (args.command === "commitdb") {
    if ("asset-cid" in args.params) {
      const assetCid = args.params["asset-cid"];
      const existingEntryAmount: number = (await commitdb.httpPost(config.commitDatabase.amountUrl, { "assetCid": assetCid })).response.commitAmount;

      const updatedAmounts = await commitdb.update(
        assetCid,
        blockchain,
        existingEntryAmount,
        config.commitDatabase.commitUrl,
        config.commitDatabase.accessToken
      );

      console.log(`Update status of Asset ${colors.green(assetCid)} in Commit database`);
      console.log(`existed entries: ${colors.blue(updatedAmounts.originalDbEntryAmount.toString())}`);
      console.log(`  added entries: ${colors.blue(updatedAmounts.updateDbEntryAmount.toString())}`);
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