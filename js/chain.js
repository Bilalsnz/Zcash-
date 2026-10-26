import { endpoint, NETWORK } from "./config.js";

// Intentionally unimplemented until the disclosure format, endpoint API,
// and chain-data requirements are confirmed. Never silently fall back to demo data.
export async function fetchTransaction(txid) {
  if (!txid || typeof txid !== "string") {
    throw new Error("A transaction ID is required.");
  }
  const url = endpoint();
  throw new Error(`Chain lookup is not implemented for ${NETWORK}. Confirmed endpoint: ${url}`);
}
