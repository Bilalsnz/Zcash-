import test from "node:test";
import assert from "node:assert/strict";
import { assessResponse, ACTIVATION_HEIGHT, BRANCH_ID } from "../js/readiness.js";

test("testnet response at activation height reports height signal only", () => {
  const result = assessResponse(JSON.stringify({ chain: "test", blocks: ACTIVATION_HEIGHT + 1, subversion: "/Zebra:test/" }));
  assert.equal(result.badge, "HEIGHT SIGNAL ONLY");
  assert.equal(result.readiness, "Height signal only");
  assert.equal(result.network, "test");
  assert.equal(result.height, ACTIVATION_HEIGHT.toLocaleString("en-US"));
  assert.match(result.reason, new RegExp(BRANCH_ID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("mainnet response is rejected for testnet assessment", () => {
  const result = assessResponse(JSON.stringify({ chain: "main", blocks: ACTIVATION_HEIGHT + 10 }));
  assert.equal(result.badge, "NETWORK NOT CONFIRMED");
  assert.equal(result.readiness, "Cannot assess safely");
});

test("testnet response below activation is pre-NU7 by height", () => {
  const result = assessResponse(JSON.stringify({ chain: "test", blocks: ACTIVATION_HEIGHT - 1 }));
  assert.equal(result.badge, "BEFORE ACTIVATION");
  assert.equal(result.readiness, "Not ready by height");
});

test("malformed JSON returns a parse failure, not a guessed state", () => {
  const result = assessResponse('{"chain":"test",');
  assert.equal(result.badge, "MALFORMED JSON");
  assert.equal(result.readiness, "Unable to assess");
});
