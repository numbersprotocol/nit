# Nit

Nit is git for web3 digital asset and helps user to commit an asset's activities (chronicle) to blockchain.

## Example: Initial Registration

If it's your first time to run `nit`, initialize Nit and set up configurations:

```
$ nit init
$ nit config -e
```

The default integrity register (smart contract) is running on Avalanche Fuji (Testnet). You need to get some testing tokens from the [Fuji faucet](https://faucet.avax-test.network) for paying transaction fee.

Create a working directory for the targeting asset:

```
$ mkdir ~/temp
$ cd ~/temp
```

Create the Asset Tree of the targeting asset. Example:

```
$ cat assetTree.json
{
  "assetCid": "bafybeihfzv2zzffznveiezqien5ejztfukjex7nhlki3hjy5zncsoccxdi",
  "assetSha256": "63560bb47ebfabb7ab4262dbc61e4445eaff184b1ee5a70b55aabe4c333bcef1",
  "assetCreator": "bafkreihkrnjvjeijjhalozcfpgrgb46673dlt4e3qm5bmvzzb4if423wse",
  "assetTimestampCreated": 1401649200,
  "license": {
    "name": "mit",
    "document": "https://opensource.org/licenses/MIT"
  },
  "nftRecords": {},
  "integrityCid": "bafkreicq7kqelooegxd6sq4rpwvxbdu36bz6wpgxeivmndxne4t6pxo22q",
  "integritySha256": "50faa045b9c435c7e943917dab708e9bf073eb3cd7222ac68eed2727e7dddad4",
  "abstract": "Richard's Middle out compression engine, Weissman score of 5.2",
  "encodingFormat": "image/jpeg"
}
```

To access the file of the CID, you can use browser to open the URL: `https://<cid>.ipfs.dweb.link`

To generate CIDs for the targeting asset or the integrity easily, you can use:

```
$ nit ipfsadd <filepath>
```

You can check the example data in `example/mocks/` for creating your own Asset Tree.

After created the Asset Tree of the targeting asset, create a Commit candidate for the Asset Tree:

```
$ nit add <assetTreeFilepath>
```

Double check the Commit information meets your expectation:

```
$ nit status
```

Register the Commit on blockchain:

```
$ nit commit -m "commit description"
```

You can check the Commit on blockchain by following the explorer URL returned by Nit.
