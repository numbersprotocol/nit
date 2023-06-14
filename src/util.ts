export function isSuperset(set: Set<string>, subset: Set<string>) {
  for (let elem of Array.from(subset.values())) {
    if (!set.has(elem)) {
        return false
    }
  }
  return true
}

/* Deep copy pure data which does not contain any function.
 */
export function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}

export function mergeJsons(jsonArray: object[]): object {
  return Object.assign({}, ...jsonArray);
}

export function timestampToIsoString(timestamp): string {
  try {
    return new Date((parseInt(timestamp) * 1000)).toISOString()
  } catch (error) {
    console.log(`Invalid timestamp ${timestamp}. ${error}`);
    return "";
  }
}