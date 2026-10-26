import { makeResult, STATUS } from "./result.js";

// Deliberately fails closed. Parsing a receipt or finding a transaction does not
// prove that a specific shielded recipient received a claimed amount.
export async function verifyDisclosure(receipt, chainData) {
  void receipt;
  void chainData;
  return makeResult({
    txStatus: "unknown",
    evidence: [],
    scope: [],
    status: STATUS.NOT_VERIFIABLE,
    reason: "Verification is disabled until the Zcash disclosure mechanism and independent verification path are confirmed.",
  });
}
