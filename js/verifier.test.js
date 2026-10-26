// Gate tests are intentionally marked TODO until a real disclosure verifier exists.
// Do not replace these with mocked success responses and call the gate passed.
// Run with a Node version supporting node:test after the real verifier is implemented.
import test from "node:test";

test.todo("accept a disclosure for a real, confirmed Zcash testnet payment");
test.todo("reject the same disclosure when a cryptographically bound amount is altered");
test.todo("reject the same disclosure when a cryptographically bound txid is altered");
test.todo("return NOT_VERIFIABLE when chain data is unavailable");
test.todo("never classify receipt parsing alone as payment verification");
