**BFT (Byzantine Fault Tolerant) Tiny Merge**

**Purpose:** BFT Tiny Merge is a lightweight system designed for situations where agents (users or devices) are not necessarily trusted but still need to make changes to a shared dataset. This system can also be used in invite-only scenarios or where identity verification is required.

**Addressing Common BFT Attacks:**

1. *Max Global Sequence Numbers:* Implement a mechanism that prevents users from setting the maximum global sequence number and breaking the document.
2. *Tie-breaking by Agent ID:* Utilize tie-breaking by value instead of by agent ID to avoid conflicts and maintain consistency.
3. *Arbitrary Data Growth:* Employ a fixed size byte array for data storage, limiting the potential for arbitrary data growth.

**Connection Process:**

When an agent connects to the system, it sends a snapshot of its latest state, which includes:

- The maximum local sequence numbers (seqs) for each agent involved
- Public keys and digital signatures associated with local seqs
- Local seqs serve as a resource to be spent when including changes in the global seq.

The agent also sends the latest global sequence numbers and their corresponding values, which represent the most recent changes made by all agents.

**Server Constraints:**

- The server has a limited storage capacity for bytes, so you don't need to worry about agents flooding the server with data.
- Each agent has a cap on the number of seqs they can contribute to the global sequence number (up to 1 billion). This limit prevents an agent from sending the maximum possible sequence number and disrupting the system.

**Processing Changes:**

To process changes, the server:

- Applies local seqs, validating them using the attached public keys and digital signatures
- Attempts to apply global seqs and their values

A global seq is considered valid if it is within the allowable range at that point in time. If a global seq is too high, the change is deemed invalid and won't be applied.

Once a global seq is validated, the server checks the associated value. If the value is valid, the change is applied; if not, the change is considered invalid and won't be applied.

When merging changes, the system first takes into account the global seq, and then the value.

**Security Considerations:**

This system can be exploited if an agent creates multiple accounts and sends changes with the maximum possible global seq for each account. To mitigate this risk, use identity verification or invite-only access to ensure that only authorized agents can interact with the system.
