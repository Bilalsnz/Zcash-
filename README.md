# NU7 Check

A small, mobile-first diagnostic UI for investigating Zcash Testnet node endpoints and NU7 activation signals.

## What it does

- Accepts a full HTTP(S) JSON-RPC endpoint URL.
- Sends a read-only `getblockchaininfo` request from the browser.
- Displays the response status, recognizable network name, reported height, and software version when present.
- Compares a reported Testnet height with the official NU7 activation height.
- Fails closed when the network or height cannot be determined.

## Consensus constants

From [ZIP 259: Deployment of the NU7 Network Upgrade](https://zips.z.cash/zip-0259):

- Testnet NU7 activation height: `4,465,026`
- NU7 consensus branch ID: `0x77190AD9`

NU7 activated on public Testnet at that height. The tool uses this as a reference point, not as proof of transaction acceptance.

## Important limitations

**This is not a full NU7 transaction readiness certification.** A reported Testnet height at or above activation is only one signal. The tool does not submit a transaction, test mempool admission, independently validate the node's consensus chain, or prove that every NU7 transaction will be accepted. It cannot infer a server's exact software version if the RPC response does not include it.

The browser request requires an HTTP(S) JSON-RPC endpoint that allows cross-origin browser requests (CORS). Many node RPCs are intentionally private or require authentication. Do not expose a node's RPC publicly just to use this page, and do not enter credentials, seed phrases, or private keys. Hosh's listed lightwalletd endpoints generally use gRPC, which is not the same protocol as browser-accessible JSON-RPC. A failed probe may mean CORS, authentication, TLS, endpoint protocol, or connectivity problems, not necessarily that the node is offline.

Only use Testnet endpoints. No transaction is broadcast. No server credentials are collected or stored by this page.

## Run locally

Serve the repository as static files, or deploy it to a static host. Open `index.html` through HTTP(S), enter a compatible Testnet JSON-RPC URL, and run the check. Opening the file directly may have browser restrictions.

## Current status

This is an experimental prototype. It has not yet been demonstrated against a confirmed public, browser-accessible Testnet JSON-RPC endpoint. Do not present the result as a completed end-to-end transaction readiness test until that validation has been performed.

## References

- [ZIP 259](https://zips.z.cash/zip-0259)
- [Zebra releases](https://github.com/ZcashFoundation/zebra/releases)
- [Hosh Zcash Light Wallet Uptime](https://hosh.zec.rocks/zec)

## License

No license has been added yet.