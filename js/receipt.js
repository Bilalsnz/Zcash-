// Parsing validates shape only. It does not establish authenticity or payment.
export function parseReceipt(raw) {
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Paste a receipt JSON object first.");
  }

  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("Receipt is not valid JSON.");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Receipt must be a JSON object.");
  }

  const txid = typeof value.txid === "string" ? value.txid.trim() : "";
  if (!txid) throw new Error("Receipt is missing a transaction ID (txid).");

  // Do not assume every chain or transaction ID format is identical until
  // the selected Zcash API and disclosure format have been confirmed.
  if (txid.length > 128) throw new Error("Transaction ID is unexpectedly long.");

  if (value.disclosure !== undefined && typeof value.disclosure !== "string" &&
      (typeof value.disclosure !== "object" || value.disclosure === null)) {
    throw new Error("Disclosure must be a string or an object.");
  }

  const note = typeof value.note === "string" ? value.note.slice(0, 500) : "";
  return { txid, disclosure: value.disclosure ?? null, note };
}

export function serializeReceipt(receipt) {
  return JSON.stringify({
    version: 1,
    network: "testnet",
    txid: receipt.txid,
    disclosure: receipt.disclosure ?? null,
    note: receipt.note ?? "",
  }, null, 2);
}
