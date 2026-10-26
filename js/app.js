import { assessResponse } from "./readiness.js";

const $ = (id) => document.getElementById(id);
function setBadge(label, tone = "neutral") {
  const badge = $("result-badge");
  badge.textContent = label;
  badge.className = "status-badge status-" + tone;
}
function render(result) {
  setBadge(result.badge, result.tone);
  $("result-title").textContent = result.title;
  $("result-summary").textContent = result.summary;
  $("rpc-status").textContent = result.rpcStatus;
  $("network-value").textContent = result.network;
  $("height-value").textContent = result.height;
  $("activation-value").textContent = "Testnet height 4,465,026";
  $("version-value").textContent = result.version;
  $("ready-value").textContent = result.readiness;
  $("result-reason").textContent = result.reason;
}
$("check").addEventListener("click", () => {
  const raw = $("response-json").value.trim();
  if (!raw) {
    render({
      badge: "INPUT REQUIRED", tone: "warn", title: "Paste a response first",
      summary: "Paste the JSON output from getblockchaininfo into the box above.",
      rpcStatus: "Not checked", network: "Unknown", height: "Unknown",
      version: "Unknown", readiness: "Not assessed",
      reason: "This page only analyzes text you paste. It does not contact a node or broadcast transactions."
    });
    return;
  }
  render(assessResponse(raw));
});
$("load-fixture").addEventListener("click", () => {
  $("response-json").value = JSON.stringify({
    chain: "test",
    blocks: 4465026,
    subversion: "/Zebra:2.x.x/",
    upgrades: {
      "77190ad9": { name: "NU7", activationheight: 4465026, status: "active" }
    }
  }, null, 2);
  $("fixture-note").hidden = false;
  render({
    badge: "HAND-BUILT FIXTURE", tone: "warn", title: "Example loaded",
    summary: "This is a hand-built test fixture using ZIP 259 constants, not a response captured from a live node.",
    rpcStatus: "Not live", network: "test (fixture)", height: "4,465,026 (fixture)",
    version: "Fixture value", readiness: "Example only",
    reason: "Click “Check pasted response” to run the same parser used by the tests. Do not describe this fixture as live-node evidence."
  });
});
