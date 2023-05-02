/* manual test: ./node_modules/mocha/bin/mocha -r ts-node/register --timeout 10000 tests/testAction.ts
 */

import { expect } from "chai";
import * as action from "../src/action";

describe("Action Tests", function() {
  it("Check action by providing a valid action", async function () {
    const validAction = "action-initial-registration";
    expect(action.getValidActionOrDefault(validAction)).to.be.equal(validAction);
  });

  it("Check action by providing an invalid action", async function () {
    const validAction = "action-invalid";
    expect(action.getValidActionOrDefault(validAction)).to.be.equal("action-commit");
  });

  it("Check action by providing a valid Action Nid", async function () {
    const validActionNid = "bafkreicptxn6f752c4pvb6gqwro7s7wb336idkzr6wmolkifj3aafhvwii";
    const expectedActionName = "action-initial-registration-jade";
    expect(action.getNameByNid(validActionNid)).to.be.equal(expectedActionName);
  });

  it("Check action by providing an invalid action", async function () {
    const invalidActionNid = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const expectedActionName = "action-commit";
    expect(action.getNameByNid(invalidActionNid)).to.be.equal(expectedActionName);
  });

  it("Debugging messages", async function () {
    console.log(`action: ${JSON.stringify(action.Actions, null, 2)}`);
    console.log(`action names: ${JSON.stringify(action.generateNameDictionary(action.ActionSet), null, 2)}`);
  });
});