# Nit

Nit is git for web3 digital asset and helps user to commit an asset's activities (chronicle) to blockchain. Please note, this repository is for nit open-source tools. If you are looking for accessing nit via API services, please visit [this wiki](https://github.com/numbersprotocol/enterprise-service/wiki/7.-Nit,-Native-Protocol-Tool) for more details.

## Why Nit

To make digital assets trustworthy and traceable, Nit leverages web3 technologies and Git core concepts. Everyone can chronicle their assets by creating on-chain records so that we can productively debate, narrate, and analyse. All asset histories are written on chain and are searchable by asset CID. A sample transaction can be found [here](https://snowtrace.io/tx/0x3ba2c36f7b0aeefc954041899a099c228e052a791a59f9922ab53ef9630f4a87).

Case study

1. [A crypto-based dossier could help prove Russia committed war crimes](https://edition.cnn.com/2022/06/10/tech/ukraine-war-crimes-blockchain/index.html), CNN
2. [Starling Lab and Hala Systems file Cryptographic Submission of Evidence of War Crimes in Ukraine to the International Criminal Court](https://dornsife.usc.edu/cagr-news/news/2022/06/33571-starling-lab-and-hala-systems-file-cryptographic-submission-evidence-war-crimes), CAGR

## Commit & Asset Tree

nit adopt similar design as git. 

* When there is an update to the asset, such as updating creator information or updating content itself to create a child asset, there should be a new commit attach the asset itself.

* Every asset has a Tree file in IPFS to describe the property of the asset, including creator, creation time, license, etc. The asset tree CID is included in the on-chain message. Here is the example of the [asset tree](https://bafkreigbl7262jgwykk6ce47gbzvh4udr3rtzkpgd3b465664gzxma6zfi.ipfs.dweb.link/). 

The  db diagram can be found [here](https://dbdiagram.io/d/6220e69c54f9ad109a54c3a5). In this diagram, you will find tables of `commit` and `assetTree` with the explanation of each data field

## Installation

```shell
yarn global add @numbersprotocol/nit
```

## Example: Initial Registration

If it's your first time to run `nit`, initialize Nit with default configuration:

```
nit init
```

and provide personal information. The details of the Nit configuration format is in the [Configuration](#configuration) section below.

```
nit config -e
```

The default integrity register (smart contract) is running on Avalanche Fuji (Testnet) and will migrate to Numbers mainnet in the future. You need to get some testing tokens from the [Fuji faucet](https://faucet.avax-test.network) for paying transaction fee.

Create a working directory for the targeting asset:

```
mkdir ~/temp && cd ~/temp
```

Create the Asset Tree of the targeting asset. Example:

```
nit add <asset-filepath> -m "First registration."
```

To access the file of the CID, you can use browser to open the URL: `https://<cid>.ipfs.dweb.link`

Double check the Commit information meets your expectation:

```
nit status
```

Register the Commit on blockchain:

```
nit commit -m "commit description"
```

You can check the Commit on blockchain by following the explorer URL returned by Nit.

## Get On-Chain Information

### Get on-chain block numbers of an Asset

```shell
nit log <asset-cid> --blocks
```

Example command of the mockup Asset

```shell
nit log aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa --blocks
```

Commit block numbers and indices

```
Total Commit number: 74
Index: 0, Block number: 7236185
Index: 1, Block number: 7236445
...
Index: 71, Block number: 10849040
Index: 72, Block number: 10849133
Index: 73, Block number: 11040035
```

### Get Commits of an Asset

You can specify the starting and ending indices of block numbers:

```shell
nit log <asset-cid> --from-index 3 --to-index 5
```

You will get the Commits from the block numbers associated to index 3 & 4.

Example command of the mockup Asset

```shell
nit log aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa --from-index 71 --to-index 73
```

<details>
<summary>Commits in block 71 & 72 (exclude block 73)</summary>

```shell
Total Commit number: 74

block number: 10849040
tx: 0x6d5902173255afe379cc4ae934a6c684ecfd865679286665622de3cf10eddcbe
{
  "assetTreeCid": "bafkreifnpykuw5g2m4k5k5wf55zxtzjmcftstzhtsarlkqytimajj3ntlq",
  "assetTreeSha256": "ad7e154b74da6715d576c5ef7379e52c116729e4f39022b54313430094edb35c",
  "assetTreeSignature": "0x9faf5c9d13b8d90a7a8e88aa6daf089ca89593c28dc241347c4756e83c2f1ea53ed1cb9e189f7ab81c81327527c97595f44ed71dda8e5d78ebe0dccfe9dd27081c",
  "author": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "committer": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "provider": "bafkreigtmno2wacf4ldb6ewbkboe7oojedsp3dky35djytor6guwzhbdpa",
  "timestampCreated": 1655720482,
  "action": "bafkreiavifzn7ntlb6p2lr55k3oezo6pofwvknecukc5auhng4miowcte4",
  "actionResult": "https://bafkreifnpykuw5g2m4k5k5wf55zxtzjmcftstzhtsarlkqytimajj3ntlq.ipfs.dweb.link",
  "abstract": "Action action-initial-registration."
}

block number: 10849133
tx: 0xe383fdc0f4eaf44e8bde4737f33bcd45742dcb846f3beb890976793d7cc9358e
{
  "assetTreeCid": "bafkreidptwydheqfybug4mmnzwzdg4rqxjvg4akl2pwjmrfxhqz33qv4tu",
  "assetTreeSha256": "6f9db0339205c0686e318dcdb2337230ba6a6e014bd3ec9644b73c33bdc2bc9d",
  "assetTreeSignature": "0xef547e124a9904dbdb5a418022ad03c621201b74111a3b4c5fac61b1d82350170766cef8a27737d21ca9b1bd4e04f7cdea460706b68b14e0ed17f2a3de83f9131b",
  "author": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "committer": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "provider": "bafkreigtmno2wacf4ldb6ewbkboe7oojedsp3dky35djytor6guwzhbdpa",
  "timestampCreated": 1655720763,
  "action": "bafkreiavifzn7ntlb6p2lr55k3oezo6pofwvknecukc5auhng4miowcte4",
  "actionResult": "https://bafkreidptwydheqfybug4mmnzwzdg4rqxjvg4akl2pwjmrfxhqz33qv4tu.ipfs.dweb.link",
  "abstract": "Action action-initial-registration."
}
```

</details>

### Get difference of Commits and Asset Trees of an Asset

```shell
nit diff <asset-cid> --from-index 3 --to-index 5
```

Example command of the mockup Asset

```shell
nit diff aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa --from-index 71 --to-index 73
```

<details>
<summary>Diff of Commits and Asset Trees in block 71 & 72 (exclude block 73)</summary>

```shell
from: block 10849040, tx 0x6d5902173255afe379cc4ae934a6c684ecfd865679286665622de3cf10eddcbe
  to: block 10849133, tx 0xe383fdc0f4eaf44e8bde4737f33bcd45742dcb846f3beb890976793d7cc9358e

Commit difference
{
  "abstract": "Action action-initial-registration.",
  "action": "bafkreiavifzn7ntlb6p2lr55k3oezo6pofwvknecukc5auhng4miowcte4",
 -"actionResult": "https://bafkreifnpykuw5g2m4k5k5wf55zxtzjmcftstzhtsarlkqytimajj3ntlq.ipfs.dweb.link",
 -"assetTreeCid": "bafkreifnpykuw5g2m4k5k5wf55zxtzjmcftstzhtsarlkqytimajj3ntlq",
 -"assetTreeSha256": "ad7e154b74da6715d576c5ef7379e52c116729e4f39022b54313430094edb35c",
 -"assetTreeSignature": "0x9faf5c9d13b8d90a7a8e88aa6daf089ca89593c28dc241347c4756e83c2f1ea53ed1cb9e189f7ab81c81327527c97595f44ed71dda8e5d78ebe0dccfe9dd27081c",
 +"actionResult": "https://bafkreidptwydheqfybug4mmnzwzdg4rqxjvg4akl2pwjmrfxhqz33qv4tu.ipfs.dweb.link",
 +"assetTreeCid": "bafkreidptwydheqfybug4mmnzwzdg4rqxjvg4akl2pwjmrfxhqz33qv4tu",
 +"assetTreeSha256": "6f9db0339205c0686e318dcdb2337230ba6a6e014bd3ec9644b73c33bdc2bc9d",
 +"assetTreeSignature": "0xef547e124a9904dbdb5a418022ad03c621201b74111a3b4c5fac61b1d82350170766cef8a27737d21ca9b1bd4e04f7cdea460706b68b14e0ed17f2a3de83f9131b",
  "author": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "committer": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "provider": "bafkreigtmno2wacf4ldb6ewbkboe7oojedsp3dky35djytor6guwzhbdpa",
 -"timestampCreated": 1655720482
 +"timestampCreated": 1655720763
}

Asset Tree difference
{
  "abstract": "",
  "assetCid": "bafybeif3ctgbmiso4oykvwj6jebyrkjxqr26bfrkesla5yr2ypgx47wgle",
  "assetCreator": null,
  "assetSha256": null,
  "assetTimestampCreated": null,
  "assetTreeCustomKey1": "foo",
  "assetTreeCustomKey2": "bar",
  "encodingFormat": "application/zip",
  "license": {
    "document": "https://starlinglab.org",
    "name": "Starling License"
  },
 +"nftRecord": "bafkreielfjf7sfxigb4r7tejt7jhl6kthxoujwziywixlwxjjho32may7y"
}
```
</details>

### Get merge of Commits and Asset Trees of an Asset

```shell
nit merge <asset-cid> --from-index 3 --to-index 5
```

Example command of the mockup Asset

```shell
nit merge aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa --from-index 71 --to-index 73
```

<details>
<summary>Merge of Commits and Asset Trees in block 71 & 72 (exclude block 73)</summary>

```shell
from: block 10849040, tx 0x6d5902173255afe379cc4ae934a6c684ecfd865679286665622de3cf10eddcbe
  to: block 10849133, tx 0xe383fdc0f4eaf44e8bde4737f33bcd45742dcb846f3beb890976793d7cc9358e

Commit merge
{
  "assetTreeCid": "bafkreidptwydheqfybug4mmnzwzdg4rqxjvg4akl2pwjmrfxhqz33qv4tu",
  "assetTreeSha256": "6f9db0339205c0686e318dcdb2337230ba6a6e014bd3ec9644b73c33bdc2bc9d",
  "assetTreeSignature": "0xef547e124a9904dbdb5a418022ad03c621201b74111a3b4c5fac61b1d82350170766cef8a27737d21ca9b1bd4e04f7cdea460706b68b14e0ed17f2a3de83f9131b",
  "author": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "committer": "bafkreigzixvzu2tbxbvmvwcvlz2zwoagmb6c2q5egaq4lmd5sesyopmmx4",
  "provider": "bafkreigtmno2wacf4ldb6ewbkboe7oojedsp3dky35djytor6guwzhbdpa",
  "timestampCreated": 1655720763,
  "action": "bafkreiavifzn7ntlb6p2lr55k3oezo6pofwvknecukc5auhng4miowcte4",
  "actionResult": "https://bafkreidptwydheqfybug4mmnzwzdg4rqxjvg4akl2pwjmrfxhqz33qv4tu.ipfs.dweb.link",
  "abstract": "Action action-initial-registration."
}

Asset Tree merge
{
  "assetCid": "bafybeif3ctgbmiso4oykvwj6jebyrkjxqr26bfrkesla5yr2ypgx47wgle",
  "assetSha256": null,
  "encodingFormat": "application/zip",
  "assetTimestampCreated": null,
  "assetCreator": null,
  "license": {
    "name": "Starling License",
    "document": "https://starlinglab.org"
  },
  "abstract": "",
  "assetTreeCustomKey1": "foo",
  "assetTreeCustomKey2": "bar",
  "nftRecord": "bafkreielfjf7sfxigb4r7tejt7jhl6kthxoujwziywixlwxjjho32may7y"
}
```
</details>

## Configuration

The Nit configuration mimics the [Hardhat configuration](https://hardhat.org/config) with additional fields.

The Nit configuration is at `~/.nitconfig.json`. Linux users can open the default editor by the command below:

```shell
nit config -e
```

<details>
<summary>Example of a Nit configuration:</summary>

```json
{
  // CID of the author's profile of original Assets
  "author": "bafkreihkrnjvjeijjhalozcfpgrgb46673dlt4e3qm5bmvzzb4if423wse",
  // CID of the committer's profile who creates Asset Trees and Commits
  "committer": "bafkreihkrnjvjeijjhalozcfpgrgb46673dlt4e3qm5bmvzzb4if423wse",
  // CID of the service provider who hosts the integrity registration service
  "provider": "bafkreido4zu743f6isb5wninfkedvbirj2ngb5fkivrpdijh2xtd3s6rnu",
  "defaultNetwork": "fuji",
  "network": {
    "rinkeby": {
      "url": "https://eth-rinkeby.alchemyapi.io/v2/UO5kfog_UDJgGCuqeaSJmnE95_gKOnFN",
      "gasLimit": 200000,
      "accounts": [
        "<private-key>",
      ],
      // integrity record contract address
      "contract": "0x2Aa4e29872DE77E1Bc6cF310d647F9cB0f9a073B",
      "explorerBaseUrl": "https://rinkeby.etherscan.io/tx"
    },
    "avalanche": {
      "chainId": 43114,
      "url": "https://api.avax.network/ext/bc/C/rpc",
      "accounts": [
        "<private-key>",
      ],
      "contract": "0x1970aFD0831E9233667fb9484910926c2b18BCb4",
      "explorerBaseUrl": "https://snowtrace.io/tx"
    },
    "fuji": {
      "url": "https://api.avax-test.network/ext/bc/C/rpc",
      "chainId": 43113,
      "gasLimit": 200000,
      "accounts": [
        "<private-key>",
      ],
      "contract": "0xA2De03bee39Fa637440909abC5621063bC5DA926",
      "explorerBaseUrl": "https://testnet.snowtrace.io/tx"
    },
    "polygon": {
      "url": "https://polygon-rpc.com/",
      "gasPrice": 60000000000,
      "accounts": [
        "<private-key>",
      ],
      "contract": "0x2094747c6c870f20E38f701116CBb46845b5E5c1",
      "explorerBaseUrl": "https://polygonscan.com/tx"
    },
    "moonbase": {
      "url": "https://rpc.api.moonbase.moonbeam.network",
      "accounts": [
        "<private-key>",
      ],
      "contract": "0xfbeA33fe2b266697404Dc5D1dC0A4ee9D0eDED23",
      "explorerBaseUrl": "https://moonbase.moonscan.io/tx"
    },
    "aurora_testnet": {
      "url": "https://testnet.aurora.dev/",
      "chainId": 1313161555,
      "accounts": [
        "<private-key>",
      ],
      "contract": "0x8e1bF90681C672e25aE880767d57f0552f6F5Cd1",
      "explorerBaseUrl": "https://testnet.aurorascan.dev/tx"
    }
  },
  // For the ipfsadd command. We will support web3.storage soon
  "infura": {
    "projectId": "aaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "projectSecret": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
  },
  // For IPFS cat source. We support w3s, infura and numbers
  "ipfsCat": "w3s",
}
```

</details>

## Verification

Verify the integrity of an Asset Tree

```shell
nit verify --integrity-hash <assetTreeSha256> --signature <assetTreeSignature>
```

Example

```shell
nit verify --integrity-hash 6f9db0339205c0686e318dcdb2337230ba6a6e014bd3ec9644b73c33bdc2bc9d --signature 0xef547e124a9904dbdb5a418022ad03c621201b74111a3b4c5fac61b1d82350170766cef8a27737d21ca9b1bd4e04f7cdea460706b68b14e0ed17f2a3de83f9131b
```

Verification result

```shell
Signer address: 0x63B7076FC0A914Af543C2e5c201df6C29FCC18c5
```

If the signer address is different from the Committer's wallet address, you can treat this Commit as not trustworthy.
