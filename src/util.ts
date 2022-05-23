export function isSuperset(set: Set<string>, subset: Set<string>) {
  console.log(`${set.size}, ${set.keys()}`);
  console.log(`${subset.size}, ${subset.keys()}`);

  for (let elem of Array.from(subset.values())) {
    console.log(`elem: ${elem}, ${set.has(elem)}`);
    if (!set.has(elem)) {
        return false
    }
  }
  console.log("return true");
  return true
}