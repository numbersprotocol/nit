/* Spec of Actions
 * https://docs.numbersprotocol.io/introduction/numbers-protocol/defining-web3-assets/commit#actions
 */

export const ActionSet = {
  // default, the same as action-initial-registration-jade
  "action-initial-registration": {
    nid: "bafkreicptxn6f752c4pvb6gqwro7s7wb336idkzr6wmolkifj3aafhvwii",
    content: {
      "networkActionName": "initial registration",
      "blockchain": "jade",
      "tokenAddress": "",
      "provider": "bafkreigrt5tepycewppysdwcjccdkdvvc2ztelqv64idgautq52g3vfh4i",
      "abstract": "Register asset to the Numbers network",
      "type": "new"
    }
  },
  "action-initial-registration-avalanche": {
    nid: "bafkreiavifzn7ntlb6p2lr55k3oezo6pofwvknecukc5auhng4miowcte4",
    content: {
      "networkActionName": "initial registration",
      "blockchain": "avalanche",
      "tokenAddress": "",
      "provider": "bafkreido4zu743f6isb5wninfkedvbirj2ngb5fkivrpdijh2xtd3s6rnu",
      "abstract": "Register asset to the Numbers network",
      "type": "new"
    }
  },
  "action-initial-registration-jade": {
    nid: "bafkreicptxn6f752c4pvb6gqwro7s7wb336idkzr6wmolkifj3aafhvwii",
    content: {
      "networkActionName": "initial registration",
      "blockchain": "jade",
      "tokenAddress": "",
      "provider": "bafkreigrt5tepycewppysdwcjccdkdvvc2ztelqv64idgautq52g3vfh4i",
      "abstract": "Register asset to the Numbers network",
      "type": "new"
    }
  },
  "action-initial-registration-iota": {
    nid: "bafkreibnyl3ohbx76rzxmdzfyayvztjcqgjv745wh4t3z6a4ung43xd554",
    content: {
      "networkActionName": "initial registration",
      "blockchain": "iota",
      "tokenAddress": "",
      "provider": "bafkreigrt5tepycewppysdwcjccdkdvvc2ztelqv64idgautq52g3vfh4i",
      "abstract": "Register asset to the Numbers network",
      "type": "new"
    }
  },

  "action-commit": {
    nid: "bafkreiceiqfe4w4g4j46rsi4h4tbqu35ivewfxm4q743tfmegscpg7d63m",
    content: {
      "networkActionName": "commit",
      "blockchain": "jade",
      "tokenAddress": "",
      "provider": "bafkreigrt5tepycewppysdwcjccdkdvvc2ztelqv64idgautq52g3vfh4i",
      "abstract": "Commit asset history to Numbers network",
      "type": "update"
    }
  },

  // default, the same as action-mint-erc721-nft-jade
  "action-mint-erc721-nft": {
    nid: "bafkreiakk6le5wgbl3zz3acybd2wfc2y32mpmxj4kbjjjskom7cy2akwly",
    content: {
      "networkActionName": "mint ERC-721 NFT",
      "blockchain": "jade",
      "tokenAddress": "",
      "provider": "bafkreigrt5tepycewppysdwcjccdkdvvc2ztelqv64idgautq52g3vfh4i",
      "abstract": "Mint ERC-721 NFT on Jade",
      "type": "update"
    }
  },
  "action-mint-erc721-nft-avalanche": {
    nid: "bafkreibro4v4vsibvr47uwhkj6gqpc5rfvvq5ykfzzz4jnzvm23zwoh2gq",
    content: {
      "networkActionName": "mint ERC-721 NFT",
      "blockchain": "avalanche",
      "tokenAddress": "",
      "provider": "bafkreido4zu743f6isb5wninfkedvbirj2ngb5fkivrpdijh2xtd3s6rnu",
      "abstract": "Mint ERC-721 NFT on Avalanche",
      "type": "update"
    }
  },
  "action-mint-erc721-nft-ethereum": {
    nid: "bafkreighzhmelvwlntigjq6ushun4mz36x6cq5nztkvcac47bdxz2ipeca",
    content: {
      "networkActionName": "mint ERC-721 NFT",
      "blockchain": "ethereum",
      "tokenAddress": "",
      "provider": "bafkreido4zu743f6isb5wninfkedvbirj2ngb5fkivrpdijh2xtd3s6rnu",
      "abstract": "Mint ERC-721 NFT on Ethereum",
      "type": "update"
    }
  },
  "action-mint-erc721-nft-jade": {
    nid: "bafkreiakk6le5wgbl3zz3acybd2wfc2y32mpmxj4kbjjjskom7cy2akwly",
    content: {
      "networkActionName": "mint ERC-721 NFT",
      "blockchain": "jade",
      "tokenAddress": "",
      "provider": "bafkreigrt5tepycewppysdwcjccdkdvvc2ztelqv64idgautq52g3vfh4i",
      "abstract": "Mint ERC-721 NFT on Jade",
      "type": "update"
    }
  },
  "action-mint-erc721-nft-polygon": {
    nid: "bafkreigdxfmwhhepusyhaoidyzy6bv7jzpc5liqohyc6numgvvbfwabn6a",
    content: {
      "networkActionName": "mint ERC-721 NFT",
      "blockchain": "polygon",
      "tokenAddress": "",
      "provider": "bafkreido4zu743f6isb5wninfkedvbirj2ngb5fkivrpdijh2xtd3s6rnu",
      "abstract": "Mint ERC-721 NFT on Polygon",
      "type": "update"
    }
  },
  "action-mint-erc721-nft-thundercore": {
    nid: "bafkreih7gzxeukcnosbotvpq7hw6htlxoi2dzzm2nnkskloazgw2sbh55i",
    content: {
      "networkActionName": "mint ERC-721 NFT",
      "blockchain": "thundercore",
      "tokenAddress": "",
      "provider": "bafkreido4zu743f6isb5wninfkedvbirj2ngb5fkivrpdijh2xtd3s6rnu",
      "abstract": "Mint ERC-721 NFT on ThunderCore",
      "type": "update"
    }
  },
};

/* DESIGN: To keep backward compatibility, we keep Actions.
 */

function generateNidDictionary(actionSet) {
  const nidDictionary = {};

  for (const key in actionSet) {
    if (actionSet.hasOwnProperty(key)) {
      nidDictionary[key] = actionSet[key].nid;
    }
  }

  return nidDictionary;
}

export const Actions = generateNidDictionary(ActionSet);

/* Return the action key if it's valid, otherwise return "commit". */
export function getValidActionOrDefault(action: string): string {
  return Actions.hasOwnProperty(action) ? action : "action-commit";
}

export function generateNameDictionary(actionSet) {
  const keyDictionary = {};

  for (const key in actionSet) {
    if (actionSet.hasOwnProperty(key)) {
      const nid = actionSet[key].nid;
      keyDictionary[nid] = key;
    }
  }

  return keyDictionary;
}

export function getNameByNid(actionNid) {
  const nameDictionary = generateNameDictionary(ActionSet);

  if (nameDictionary.hasOwnProperty(actionNid)) {
    return nameDictionary[actionNid];
  } else {
    return 'action-commit';
  }
}