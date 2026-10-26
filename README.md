# NU7 Check

A mobile-first diagnostic tool for inspecting a pasted Zcash Testnet `getblockchaininfo` JSON response.

## What it does

- Paste a `getblockchaininfo` response into the page.
- Parse the JSON locally in the browser, with no network request.
- Identify whether the reported chain is Testnet and compare its reported block height with the NU7 Testnet activation height.
- Show a cautious readiness signal or a clear error when the input is malformed or incomplete.

**Live endpoint checks: not yet verified.**

## Consensus constants

According to [ZIP 259: Deployment of the NU7 Network Upgrade](https://zips.z.cash/zip-0259):

- Testnet NU7 activation height: `4,465,026`
- NU7 consensus branch ID: `0x77190AD9`

The activation height is a reference point, not proof of transaction acceptance. ZIP 259's deployment status and network state may evolve, so check the source for current details.

## Testing

Run the four readiness tests with Node.js:

```sh
node --test tests/readiness.test.js
```

The test cases cover:
1. A Testnet response at the activation height.
2. A Mainnet response.
3. A Testnet response below the activation height.
4. Malformed JSON.

The example fixture in the UI and test fixtures are hand-built from ZIP 259 constants, not captured from a live node.

## Important limitations

This is an offline parser for pasted text, not a live node monitor or full NU7 transaction-readiness certification. The result depends on the accuracy and freshness of the response supplied by the user. A reported height at or above activation does not prove that the node software is NU7-ready, that its consensus branch ID matches, that mempool admission will succeed, or that a specific transaction will be accepted.

The tool does not contact an RPC endpoint, broadcast transactions, independently validate the chain, or collect credentials. Do not paste private keys, seed phrases, authentication tokens, or other secrets. Only use Testnet node output.

## Run locally or deploy

Serve the repository as static files or deploy it to a static host such as Vercel. Open the page and paste the JSON response body from `getblockchaininfo`. No server function, API key, or proxy is needed.

## References

- [ZIP 259](https://zips.z.cash/zip-0259)
- [Zebra releases](https://github.com/ZcashFoundation/zebra/releases)

## License

No license has been added yet.
