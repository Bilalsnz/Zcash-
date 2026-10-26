export const STATUS = Object.freeze({
  VERIFIED: "verified",
  NOT_VERIFIABLE: "not_verifiable",
  INVALID: "invalid",
  PENDING: "pending",
});

export function makeResult({
  txStatus = "unknown",
  evidence = [],
  scope = [],
  status = STATUS.NOT_VERIFIABLE,
  reason = "Verification has not been completed.",
} = {}) {
  return { txStatus, evidence, scope, status, reason };
}

export function displayClass(result) {
  if (result.status === STATUS.VERIFIED && result.evidence.length > 0) {
    return "result-verified";
  }
  if (result.status === STATUS.INVALID) return "result-invalid";
  if (result.status === STATUS.PENDING) return "result-pending";
  return "result-not-verifiable";
}
