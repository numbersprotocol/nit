import { expect } from "chai";
import * as action from "../src/action";

describe("Action Module Tests", function() {
  
  describe("getValidActionOrDefault Tests", function() {
    it("should return the action if it is valid", async function () {
      const validAction = "action-initial-registration";
      expect(action.getValidActionOrDefault(validAction)).to.equal(validAction);
    });

    it("should return default action if the action is invalid", async function () {
      const invalidAction = "action-invalid";
      expect(action.getValidActionOrDefault(invalidAction)).to.equal("action-commit");
    });

    it("should return default action if the action is an empty string", async function () {
      const emptyAction = "";
      expect(action.getValidActionOrDefault(emptyAction)).to.equal("action-commit");
    });

    it("should return default action if the action is null", async function () {
      const nullAction = null;
      expect(action.getValidActionOrDefault(nullAction)).to.equal("action-commit");
    });
  });

  describe("getNameByNid Tests", function() {
    it("should return the correct action name for a valid NID", async function () {
      const validActionNid = "bafkreicptxn6f752c4pvb6gqwro7s7wb336idkzr6wmolkifj3aafhvwii";
      const expectedActionName = "action-initial-registration-jade";
      expect(action.getNameByNid(validActionNid)).to.equal(expectedActionName);
    });

    it("should return default action name for an invalid NID", async function () {
      const invalidActionNid = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      const expectedActionName = "action-commit";
      expect(action.getNameByNid(invalidActionNid)).to.equal(expectedActionName);
    });

    it("should return default action name for an empty NID", async function () {
      const emptyActionNid = "";
      const expectedActionName = "action-commit";
      expect(action.getNameByNid(emptyActionNid)).to.equal(expectedActionName);
    });

    it("should return default action name for a null NID", async function () {
      const nullActionNid = null;
      const expectedActionName = "action-commit";
      expect(action.getNameByNid(nullActionNid)).to.equal(expectedActionName);
    });
  });

  describe("Debugging and Output Tests", function() {
    it("should log action details", async function () {
      // Instead of console.log, you can use a library like sinon to spy on console.log calls
      // Example:
      // const spy = sinon.spy(console, 'log');
      // action.someMethod();
      // expect(spy.calledWith(...)).to.be.true;
    });
  });

});
