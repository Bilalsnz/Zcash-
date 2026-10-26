import { NETWORK } from "./config.js";
import { parseReceipt } from "./receipt.js";
import { verifyDisclosure } from "./verifier.js";
import { displayClass, makeResult, STATUS } from "./result.js";

const byId = (id) => document.getElementById(id);
const out = byId("result");
const networkLabel = NETWORK.toUpperCase();
byId("network-badge").textContent = networkLabel;
out.querySelector(".network-badge").textContent = networkLabel;

const example = {
  version: 1,
  network: "testnet",
  txid: "REPLACE_WITH_A_REAL_TESTNET_TXID",
  disclosure: null,
  note: "Example shape only. This is not a valid proof."
};

byId("load-example").addEventListener("click", () => {
  byId("receipt").value = JSON.stringify(example, null, 2);
});

byId("check").addEventListener("click", async () => {
  byId("check").disabled = true;
  let result;

  try {
    const receipt = parseReceipt(byId("receipt").value);
    if (receipt.disclosure === null) {
      result = makeResult({
        status: STATUS.NOT_VERIFIABLE,
        reason: "This receipt has no disclosure. Receipt parsing is not proof of payment.",
      });
    } else {
      result = await verifyDisclosure(receipt, null);
    }
  } catch (error) {
    result = makeResult({
      status: STATUS.NOT_VERIFIABLE,
      reason: error instanceof Error ? error.message : "Unexpected input error.",
    });
  }

  renderResult(result);
  byId("check").disabled = false;
});

function renderResult(result) {
  out.className = `card result-card ${displayClass(result)}`;
  out.querySelector(".network-badge").textContent = networkLabel;
  byId("result-title").textContent = headline(result.status);
  byId("result-summary").textContent = summary(result.status);
  byId("tx-status").textContent = result.txStatus;
  byId("verified-claims").textContent = result.evidence.length ? result.evidence.join(", ") : "None";
  byId("disclosure-scope").textContent = result.scope.length ? result.scope.join(", ") : "Nothing verified";
  byId("result-reason").textContent = result.reason || "";
}

function headline(status) {
  return {
    [STATUS.VERIFIED]: "Payment evidence verified",
    [STATUS.NOT_VERIFIABLE]: "Cannot verify yet",
    [STATUS.INVALID]: "Evidence did not match",
    [STATUS.PENDING]: "Awaiting confirmation",
  }[status] ?? "Cannot verify yet";
}

function summary(status) {
  return {
    [STATUS.VERIFIED]: "Only the claims listed below passed the implemented checks.",
    [STATUS.NOT_VERIFIABLE]: "The available evidence was not sufficient to complete verification.",
    [STATUS.INVALID]: "The evidence was checked and failed a required integrity check.",
    [STATUS.PENDING]: "The transaction has not reached the required confirmation state.",
  }[status] ?? "No verification conclusion is available.";
}

// Safe initial state. Never default to green or imply a successful check.
renderResult(makeResult({
  status: STATUS.NOT_VERIFIABLE,
  reason: "Technical gate not passed. No cryptographic payment verification has been performed.",
}));
