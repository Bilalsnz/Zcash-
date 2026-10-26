# Build Receipts

**Status: early scaffold. Verification is not implemented.**

Build Receipts explores a way to share evidence for one Zcash payment without sharing a user's broader wallet history.

## Network policy

Development and the verification gate are **testnet-only**. The app displays its configured network on every result. Do not send mainnet funds for this scaffold.

## Current status

- [x] Mobile-first single-page shell
- [x] Receipt JSON parsing with basic input validation
- [x] Explicit result states: Verified, Invalid, Not verifiable
- [x] Network badge on every result
- [x] Chain and verifier modules intentionally fail closed
- [ ] Confirm the supported Zcash payment-disclosure mechanism
- [ ] Confirm what a disclosure cryptographically proves
- [ ] Implement testnet chain-data retrieval
- [ ] Implement independent disclosure verification
- [ ] Demonstrate a real testnet disclosure accepted by the verifier
- [ ] Demonstrate rejection of altered cryptographically bound data

## What is proven

Nothing yet. This repository is an initial scaffold, not a working payment verifier. Parsing a receipt or finding a transaction does not by itself prove that a particular shielded recipient received a particular amount.

Before implementing verification, document:
1. The disclosure format and its generation method.
2. The claims it actually proves.
3. The data and any key material required by a verifier.
4. The verification method and its cryptographic binding.
5. The privacy limitations and trust assumptions.

Research starting points:
- [Zcash developer documentation](https://zcash.readthedocs.io/)
- [librustzcash](https://github.com/zcash/librustzcash)
- [ZODL repositories](https://github.com/zcash)
- [lightwalletd](https://github.com/zcash/lightwalletd)

## Result states

- **Verified:** at least one explicitly listed claim passed the implemented verification.
- **Invalid:** evidence was actually checked and failed a required integrity or cryptographic check.
- **Not verifiable:** malformed input, unavailable chain data, unsupported disclosure, or missing verification requirements.
- **Pending confirmation:** a transaction has been detected but has not reached the configured confirmation threshold.

These states must not be collapsed into a single success/failure indicator.

## Privacy and security

- Never request or store a wallet seed phrase or private spending key.
- Do not ask users to paste viewing keys until the disclosure design and security implications have been reviewed.
- Treat receipts as untrusted input. Render user-supplied values as text, not HTML.
- Do not claim that a transaction ID alone proves a specific shielded payment.
- Do not label a payment verified until the real verifier and its tests pass.

## Difference from privacy observatories

The intended focus is voluntary, narrowly scoped payment evidence shared by a payer with a recipient. It is not a tool for broadly investigating transaction relationships or certifying complete privacy. This positioning must be revisited against the final implementation and competing projects.

## Run locally

This is a static ES-module app. Serve the repository with any local static HTTP server; opening `index.html` directly may block module imports in some browsers.

**Verification is deliberately disabled until the protocol gate is passed.** The current UI should show “Not verifiable” rather than simulate success.
