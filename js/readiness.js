export const ACTIVATION_HEIGHT = 4465026;
export const BRANCH_ID = "0x77190AD9";

function result(fields) {
  return {
    rpcStatus: "Parsed pasted JSON",
    network: "Not reported",
    height: "Not reported",
    version: "Not reported",
    readiness: "Not assessed",
    ...fields
  };
}

export function assessResponse(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return result({
      badge: "MALFORMED JSON", tone: "bad", title: "Could not parse JSON",
      summary: "The pasted text is not valid JSON.",
      rpcStatus: "Parse failed", readiness: "Unable to assess",
      reason: "Copy the JSON response body from getblockchaininfo and paste it without surrounding commentary."
    });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return result({
      badge: "UNRECOGNIZED DATA", tone: "bad", title: "Expected a JSON object",
      summary: "The pasted JSON is valid, but it is not a recognizable node response.",
      rpcStatus: "Parsed, wrong shape", readiness: "Unable to assess",
      reason: "Paste the JSON object returned by getblockchaininfo. This tool does not infer missing network or height values."
    });
  }
  if (data.error) {
    return result({
      badge: "RPC ERROR", tone: "bad", title: "The response contains an RPC error",
      summary: "The pasted response reports an error rather than usable chain information.",
      rpcStatus: "RPC error", readiness: "Unable to assess",
      reason: typeof data.error === "string" ? data.error : (data.error.message || "RPC error reported.")
    });
  }
  const root = data.result && typeof data.result === "object" ? data.result : data;
  const chainValue = root.chain ?? root.chain_name ?? root.network ?? root.chainName;
  const chain = chainValue == null ? "" : String(chainValue);
  const heightValue = root.blocks ?? root.height ?? root.best_height ?? root.bestHeight;
  const height = heightValue !== undefined && heightValue !== null && String(heightValue).trim() !== "" && Number.isFinite(Number(heightValue)) && Number(heightValue) >= 0
    ? Number(heightValue) : null;
  const versionValue = root.subversion ?? root.version ?? root.build ?? root.server_version;
  const version = versionValue == null ? "Not reported" : String(versionValue);
  const network = chain || "Not reported";
  if (!/^test(?:net)?(?:$|[-_ ])/i.test(chain) && !/^testnet$/i.test(chain)) {
    return result({
      badge: "NETWORK NOT CONFIRMED", tone: "bad", title: "Testnet not confirmed",
      summary: "The pasted response does not identify the chain as Zcash Testnet.",
      network, height: height == null ? "Not reported" : height.toLocaleString("en-US"), version,
      readiness: "Cannot assess safely",
      reason: "This checker will not treat an unreported or non-Testnet chain as Testnet. Confirm the source of the response before using it."
    });
  }
  if (height == null) {
    return result({
      badge: "PARTIAL RESPONSE", tone: "warn", title: "Testnet reported, height missing",
      summary: "The response identifies Testnet but contains no supported block-height field.",
      network, version, readiness: "Unable to assess",
      reason: "No readiness conclusion is made when block height is missing or invalid."
    });
  }
  if (height < ACTIVATION_HEIGHT) {
    return result({
      badge: "BEFORE ACTIVATION", tone: "warn", title: "Reported height is pre-NU7",
      summary: "The pasted Testnet response reports a height below the NU7 activation point.",
      network, height: height.toLocaleString("en-US"), version,
      readiness: "Not ready by height",
      reason: "Reported height is below 4,465,026. This is a pasted snapshot and may be stale; the tool does not independently validate consensus."
    });
  }
  return result({
    badge: "HEIGHT SIGNAL ONLY", tone: "warn", title: "NU7 activation height reached",
    summary: "The pasted response reports Testnet at or above the NU7 activation height.",
    network, height: height.toLocaleString("en-US"), version,
    readiness: "Height signal only",
    reason: "Expected NU7 consensus branch ID from ZIP 259: " + BRANCH_ID + ". This response alone does not prove NU7 software activation, branch-ID agreement, mempool acceptance, or acceptance of a specific transaction."
  });
}
