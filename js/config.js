// The network is deliberately fixed to testnet during the verification gate.
// Do not switch to mainnet for development or to make a demo look stronger.
export const NETWORK = "testnet";

export const CHAIN_ENDPOINTS = {
  testnet: "", // Add only after confirming a suitable endpoint and its API.
  mainnet: "",
};

export function endpoint() {
  const url = CHAIN_ENDPOINTS[NETWORK];
  if (!url) {
    throw new Error(`No verified chain endpoint configured for ${NETWORK}`);
  }
  return url;
}
