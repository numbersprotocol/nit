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