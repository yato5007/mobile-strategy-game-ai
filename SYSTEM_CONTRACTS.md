# System Contracts

This file defines how major systems connect.

Every major system must document:

1. Inputs.
2. Outputs.
3. Data types.
4. Events.
5. State ownership.
6. Dependencies.
7. What it must not control.
8. How it connects to other systems.

No branch may create a conflicting contract.

If a branch changes a contract, it must update this file and call @integration-architect.
