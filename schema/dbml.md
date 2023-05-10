```dbml
Project IntegrityRecord {
  Note: '''
  description: Numbers Protocol Integrity Record spec
  version: 4.3.0
  date: 2023-05-11
  colors:
    - purple: on blockchain (updatable)
    - blue: files on IPFS (updatable)
    - yellow: json
    - red: signature related
    - grey: centralized server or DID
  '''
}

Table commit [headercolor: #8e44ad] {
  _ none [note: 'placeholder for linking tables']
  assetCid    cid [note: 'This is NOT in the commit but the on-chain index']
  assetTreeCid cid [note: 'CID of the asset Tree file']
  assetTreeSha256 sha256 [note: 'sha256sum of the asset Tree file']
  assetTreeSignature signature [note: 'EIP-191 signature signed by author.']
  committer address [note: 'Who registers the commit']
  author address [note: 'Who write the commit']
  action cid [note: 'CID of the action profile describing the action details including actionName.']
  actionName str [note: 'name of the action, unique string']
  actionResult str [note: 'Result uri of this action']
  provider cid [note: 'CID of the commit service provider.']
  attachment str [note: 'the Nid of the attachment file.']

  Note: '''
  1. The goal of Integrity Record is to ensure integrity of the raw asset and its derivatives like metadata and maybe the major asset.

  2. Integrity Wallet will sign sha256sum of Integrity Record.
  '''
}

Table action [headercolor: #3498db] {
  _ none [note: 'placeholder for linking tables']
  networkActionName str [note: 'name of the network action']
  blockchain network
  tokenAddress str [note: 'address of the token required for the action payment']
  provider cid [note: 'CID of the network action provider.']
  abstract str  [note: 'description of this action including how to read the results']
  type actionType
  Note: '''
  Network Actions are the Apps interacting with Assets. Every action will be recorded on blockchain.
  '''
}


Table identity [headercolor: #3498db] {

  _ none [note: 'placeholder for linking tables']
  name str [note: 'provider\'s name', default: 'NUMBERSPROTOCOL']
  wallet address [note: 'integrity wallet address, including 0x']
  profile str [note: 'IPFS address of the profile picture']
  social json [note: 'social links']
  type identityType [note: 'the type of this wallet owner']
  information json [note: 'additional info of this individual']

  Note: '''
  This table should be handled by DID or similar technology, not the core technology Numbers considered
  '''
}

Table assetTree [headercolor: #3498db] {
  _ none [note: 'placeholder for linking tables']
  assetCid cid [note: 'CID of the asset file (blob)']
  assetSha256 sha256 [note: 'sha256sum of the asset file (blob)']
  encodingFormat str [note: 'The asset\'s type expressed using a MIME format.']
  assetCreator str [note: 'Creator\'s name']
  creatorProfile cid [note: 'Creator of the asset file']
  creatorWallet address [note: 'Creator\'s wallet address']
  assetTimestampCreated timestamp [note: 'Creation time of the asset file']
  assetLocationCreated str [note: 'Creation location of the asset file']
  parentAssetCid cid [note: 'Cid of the parent asset']
  generatedBy str [note: 'AI model used to generate the content']
  generatedThrough str [note: 'URL of AI service']
  usedBy str [note: 'URL of the website that uses the asset']
  license license [note: 'license of the asset file']
  nftRecord "nftRecord[]" [note: 'List of NFT records']
  integrityCid cid [note: 'CID of the integrity proof']
  abstract str [note: 'description of this asset']
  custom json [note: 'custom fields']


  Note: '''
  EIP-191 Verification
  Input: data, signature
  Output: signer's wallet address
  '''
}

Table assetTreeVerification [headercolor: #c0392b] {
  _ none [note: 'placeholder for linking tables']
  assetTreeSha256 sha256 [note: 'sha256sum of commit']
  assetTreeSignature str [note: 'commit service provider signs metadata and generates EIP-191 signature.']

  Note: '''Verify integrity of Asset Tree.

Author (Asset Creator) creates the integritySignature.

EIP-191 Verification
  Input: data (integrity hash in sha256), signature
  Output: Author's wallet address
  '''
}

Table license [headercolor: #3498db] {
  _ none [note: 'placeholder for linking tables']
  name str [note: 'official name of this license']
  document str [note: 'IPFS file for details of this license']
}

Table nftRecord [headercolor: #3498db] {
  _ none [note: 'placeholder for linking tables']
  network network [note: 'network of the NFT token']
  contractAddress address
  tokenId str
}

Table nft [headercolor: #8e44ad] {
  tokenId str
  tokenUri str
}

Table proofVerification [headercolor: #c0392b] {
  _ none [note: 'placeholder for linking tables']
  proofSha256 sha256 [note: 'sha256sum of commit']
  proofSignature str [note: 'commit service provider signs metadata and generates EIP-191 signature.']

  Note: '''Verify integrity of Proof.

Proof Recorder creates the proofSignature.

EIP-191 Verification
  Input: data (integrity hash in sha256), signature
  Output: Proof Recorder's wallet address
  '''
}

Table proofMetadata [headercolor: #3498db] {
  _ none [note: 'placeholder for linking tables']
  //schemaVersion str [note: 'Metadata schema version with semantic versioning format a.b.c']

  timestampCreated timestamp [note: 'The moment that Metadata is created in Unix timestamp']

  proof json [note: 'System/Device information including both HW/SW']
  proofSha256 sha256 [note: 'sha256sum of proof']
  proofSignature str [note: '(Optional) Recorder signs proof and generates EIP-191 signature']
  provider cid [note: 'Proof Recorder']

  Note: '''
  1. The goal of integrity_metadata is to provide additional asset-related data including who/when/where/ownership.

  2. Recorder is a SW module collecting the SW and HW system information.

  3. A trustworthy Recorder generates proof_signature as proof of its credibility.
  '''
}


Table proof [headercolor: #f39c12] {
  _ none [note: 'placeholder for linking tables']
  _key proofKey

  Note: '''
  The SW and HW system information collected by Recorder
  '''
}

Enum "network" { //The main blockchain of the network action (bloakchain of the payment wallet)
  "ethereum"
  "bsc"
  "avalanche"
  "polygon"
  "thundercore"
  "cosmos"
}

Enum "identityType" {
  "individual"
  "business"
  "school"
  "ngo"
}

Enum "actionType" {
  "new" [note: 'The action will newly register the initial commit.']
  "update" [note: 'The action will update attribute to asset and will create a new assetTree.']
  "derive" [note: 'The action will modify asset and create child asset.']
  "use" [note: 'The action will use asset to create derived result without modifying the asset.']
}

Enum "proofKey" {
  "device.app_build" [note: 'ex: 311']
  "device.app_id" [note: 'ex: io.numbersprotocol.capturelite']
  "device.app_name" [note: 'ex: Capture']
  "device.app_version" [note: 'ex: 0.48.1']
  "device.battery_level" [note: 'ex: 0.6700000166893005']
  "device.device_name" [note: 'ex: SM-F9160']
  "device.disk_free" [note: 'ex: 29540352']
  "device.disk_total" [note: 'ex: 5950615552']
  "device.is_charging" [note: 'ex: false']
  "device.is_virtual" [note: 'ex: false']
  "device.manufacturer" [note: 'ex: "samsung']
  "device.mem_used" [note: 'ex: 68584792']
  "device.operating_system" [note: 'ex: android']
  "device.os_version" [note: 'ex: 12']
  "device.platform" [note: 'ex: android']
  "device.uuid" [note: 'ex: 755107ce5510dc60']
  "geolocation.geolocation_latitude" [note: 'ex: 24.9959323']
  "geolocation.geolocation_longitude" [note: 'ex: 121.5104948']
}

Ref: "nftRecord"."tokenId" - "nft"."tokenId"
Ref: "assetTree"."license" - "license"."_"
Ref: "assetTree"."integrityCid" - "proofMetadata"."_"
Ref: "assetTree"."creatorProfile" - "identity"."_"
Ref: "assetTree".nftRecord < nftRecord."_" // One asset can link to multiple nft_records
Ref: "commit"."action" - "action"."_"
Ref: "commit"."provider" - "identity"."_"
Ref: "action"."provider" - "identity"."_"
Ref: "proofMetadata"."provider" - "identity"."_"
Ref: "proofMetadata".proof - proof._
Ref: "commit"."assetTreeCid" - "assetTree"."_"
Ref: "commit"."committer" - "identity"."_"
Ref: "proofMetadata"."proofSha256" - "proofVerification"."proofSha256"
Ref: "proofMetadata"."proofSignature" - "proofVerification"."proofSignature"
Ref: "commit"."assetTreeSha256" - "assetTreeVerification"."assetTreeSha256"
Ref: "commit"."assetTreeSignature" - "assetTreeVerification"."assetTreeSignature"

Ref: "action"."tokenAddress" < "action"."_"
```