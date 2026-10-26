const ACTIVATION_HEIGHT = 4465026;
const BRANCH_ID = "0x77190AD9";
const $ = (id) => document.getElementById(id);

function setText(id, value) { $(id).textContent = value; }
function setBadge(label, tone = "neutral") {
  const badge = $("result-badge");
  badge.textContent = label;
  badge.className = "status-badge status-" + tone;
}
function showError(message) {
  const el = $("form-error");
  el.textContent = message;
  el.hidden = !message;
}
function normalizeUrl(raw) {
  let url;
  try { url = new URL(raw.trim()); } catch { throw new Error("Enter a complete URL, including https:// or http://."); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (url.username || url.password) throw new Error("Do not include credentials in the URL.");
  if (!url.hostname) throw new Error("The URL must include a hostname.");
  return url.href;
}
function rpcCandidates(data) {
  const root = data?.result && typeof data.result === "object" ? data.result : data;
  const chain = root?.chain ?? root?.chain_name ?? root?.network ?? root?.chainName;
  const heightValue = root?.blocks ?? root?.height ?? root?.best_height ?? root?.bestHeight;
  const version = root?.subversion ?? root?.version ?? root?.build ?? root?.server_version;
  const upgrades = root?.upgrades && typeof root.upgrades === "object" ? root.upgrades : {};
  const nu7 = Object.entries(upgrades).find(([id, value]) =>
    id.toLowerCase().replace(/^0x/, "") === BRANCH_ID.toLowerCase().replace(/^0x/, "") ||
    String(value?.name ?? "").toLowerCase().includes("nu7")
  )?.[1] ?? null;
  const consensus = root?.consensus ?? null;
  const nextBranch = consensus?.nextblock ?? consensus?.nextBlock ?? null;
  const tipBranch = consensus?.chaintip ?? consensus?.chainTip ?? null;
  return {
    chain,
    height: heightValue !== undefined && heightValue !== null && Number.isFinite(Number(heightValue)) ? Number(heightValue) : null,
    version,
    nu7,
    nextBranch: nextBranch == null ? null : String(nextBranch).toLowerCase(),
    tipBranch: tipBranch == null ? null : String(tipBranch).toLowerCase()
  };
}
async function probe() {
  showError("");
  let url;
  try { url = normalizeUrl($("endpoint").value); } catch (error) { showError(error.message); return; }
  $("probe").disabled = true;
  $("probe").textContent = "Checking…";
  setBadge("REQUESTING", "neutral");
  setText("result-title", "Request in progress");
  setText("result-summary", "Sending a read-only JSON-RPC getblockchaininfo request. No transaction will be broadcast.");
  setText("rpc-status", "Request in progress");
  setText("network-value", "Unknown");
  setText("height-value", "Unknown");
  setText("activation-value", "Testnet height 4,465,026");
  setText("version-value", "Not reported by this method");
  setText("ready-value", "Not assessed");
  setText("result-reason", "Waiting for a valid JSON-RPC response.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "1.0", id: "nu7-check", method: "getblockchaininfo", params: [] }),
      signal: controller.signal
    });
    if (!response.ok) throw new Error("HTTP " + response.status + ". The endpoint may not expose this RPC method.");
    const data = await response.json();
    if (data?.error) throw new Error(typeof data.error === "string" ? data.error : (data.error.message || JSON.stringify(data.error)));
    if (!data || typeof data !== "object" || (!("result" in data) && !("chain" in data) && !("blocks" in data))) {
      throw new Error("The response is not recognizable getblockchaininfo JSON-RPC output.");
    }
    const info = rpcCandidates(data);
    const chainText = info.chain == null ? "Not reported" : String(info.chain);
    const testnet = /test|testnet/i.test(chainText);
    const height = info.height;
    const branch = BRANCH_ID.toLowerCase();
    const nextMatches = info.nextBranch === branch || info.nextBranch === branch.replace(/^0x/, "");
    const tipMatches = info.tipBranch === branch || info.tipBranch === branch.replace(/^0x/, "");
    const reportedActive = String(info.nu7?.status ?? "").toLowerCase() === "active";
    setText("rpc-status", "Responded");
    setText("network-value", chainText);
    setText("height-value", height == null ? "Not reported" : height.toLocaleString("en-US"));
    setText("version-value", info.version == null ? "Not reported by this method" : String(info.version));
    if (!testnet) {
      setBadge("NETWORK NOT CONFIRMED", "bad");
      setText("result-title", "Testnet not confirmed");
      setText("result-summary", "The endpoint responded, but its output does not identify the chain as Testnet.");
      setText("ready-value", "Cannot assess safely");
      setText("result-reason", "Do not use this result as a Testnet readiness signal. RPC implementations expose different fields, and this tool refuses to assume an unreported network.");
    } else if (height == null) {
      setBadge("PARTIAL RESPONSE", "warn");
      setText("result-title", "Endpoint responded, data incomplete");
      setText("result-summary", "The endpoint appears to report Testnet, but no recognizable block height was found.");
      setText("ready-value", "Unable to assess");
      setText("result-reason", "The endpoint's response schema may differ from the supported fields. No readiness conclusion is made.");
    } else if (height < ACTIVATION_HEIGHT) {
      setBadge("BEFORE ACTIVATION", "warn");
      setText("result-title", "Reported height is pre-NU7");
      setText("result-summary", "The endpoint reports a Testnet height below the NU7 activation point.");
      setText("ready-value", "Not ready by height");
      setText("result-reason", "Reported height is below " + ACTIVATION_HEIGHT.toLocaleString("en-US") + ". This may be a stale or lagging endpoint. The result does not independently validate consensus.");
    } else if (reportedActive && nextMatches) {
      setBadge("NU7 SIGNALS MATCH", "good");
      setText("result-title", "NU7 reported active for next block");
      setText("result-summary", "The endpoint reports Testnet beyond activation, marks NU7 active, and reports the expected branch ID for the next block.");
      setText("activation-value", "Active, according to RPC");
      setText("ready-value", "Strong RPC signals, not certified");
      setText("result-reason", "Reported NU7 status and next-block branch ID match ZIP 259 (" + BRANCH_ID + "). This is stronger evidence than height alone, but it does not test mempool acceptance or guarantee a specific transaction will be accepted.");
    } else {
      setBadge("PARTIAL SIGNAL", "warn");
      setText("result-title", "NU7 height reached, readiness incomplete");
      setText("result-summary", "The endpoint reports Testnet at or above the NU7 activation height, but the RPC response did not confirm every expected NU7 signal.");
      setText("activation-value", reportedActive ? "Active status reported" : "Height reached; status not confirmed");
      setText("ready-value", "Height signal only");
      setText("result-reason", "Expected branch ID: " + BRANCH_ID + ". NU7 status: " + (info.nu7?.status ?? "not reported") + ". Next-block branch: " + (info.nextBranch ?? "not reported") + ". Chain-tip branch: " + (info.tipBranch ?? "not reported") + ". This tool does not broadcast a transaction or certify mempool acceptance.");
    }
  } catch (error) {
    const message = error.name === "AbortError"
      ? "Request timed out after 12 seconds."
      : (error instanceof TypeError
        ? "Browser could not read the endpoint. Common causes are CORS restrictions, TLS/network failure, or a gRPC/lightwalletd endpoint instead of HTTP JSON-RPC."
        : error.message || "Request failed.");
    setBadge("UNABLE TO VERIFY", "bad");
    setText("result-title", "Could not verify this endpoint");
    setText("result-summary", "No trustworthy chain or height result was obtained.");
    setText("rpc-status", "Failed");
    setText("ready-value", "Unable to assess");
    setText("result-reason", message + " A failed browser probe does not prove the node is offline. Do not paste credentials to work around this.");
  } finally {
    clearTimeout(timer);
    $("probe").disabled = false;
    $("probe").textContent = "Run endpoint check";
  }
}
$("probe").addEventListener("click", probe);
$("sample").addEventListener("click", () => {
  $("endpoint").value = "https://your-testnet-rpc.example";
  showError("Example format only. Replace this with a real Testnet JSON-RPC endpoint that allows browser CORS. Hosh-listed lightwalletd addresses are gRPC services and are not automatically compatible.");
  $("endpoint").focus();
});
$("endpoint").addEventListener("keydown", (event) => { if (event.key === "Enter") probe(); });
