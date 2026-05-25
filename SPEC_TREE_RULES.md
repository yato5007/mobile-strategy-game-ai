# Recursive Spec Kit Tree Rules

This project must use a recursive Spec Kit process.

## Root

The whole game project must use full Spec Kit.

## Recursive Branches

After each node completes full Spec Kit, derive child branches only if needed.
Each child branch must also use full Spec Kit.

## Depth

Maximum depth is 4.
Stop earlier when a branch becomes clear and implementable.

## Branch Count

There is no fixed maximum number of branches.

But every branch must be necessary.
Do not create duplicate branches.
Do not create decorative branches.
Do not create branches that do not help build the final game.

## Branch Necessity Rule

A new branch is allowed only if it satisfies at least one of these:

1. It represents a separate system that can be planned and implemented independently.
2. It reduces complexity of a parent node.
3. It resolves a real design, technical, gameplay, multiplayer, UI, localization, testing, bot, balance, documentation, or integration concern.
4. It prevents future conflict between major parts of the game.

A branch is forbidden if:

1. It repeats its parent.
2. It only restates general goals.
3. It does not produce implementable tasks.
4. It does not affect the final playable game.
5. It exists only to increase the number of Spec Kit nodes.

## Every Node Must Have

1. constitution
2. specification
3. clarification
4. checklist
5. plan
6. tasks
7. analysis
8. implementation
9. QA
10. review
11. integration notes
12. NODE_SUMMARY.md

## Definition of Done for Every Node

A node is complete only when it has:

1. Clear purpose.
2. Parent requirement link.
3. Completed Spec Kit artifacts.
4. Clear acceptance criteria.
5. Implementation tasks.
6. Integration notes.
7. Test notes.
8. QA result.
9. Review result.
10. No unresolved conflict with sibling nodes.

## Quality over Quantity

The goal is not to create many Spec Kit nodes.
The goal is to create useful, deep, non-duplicated, implementable nodes.

A node is invalid if it only repeats general ideas.
A node is invalid if it does not help implementation.
A node is invalid if it conflicts with another node and does not document the conflict.

## Implementation Rule

Implementation should happen mainly at leaf nodes.

Parent nodes are responsible for direction, integration, and acceptance criteria.

A parent node may implement only shared infrastructure if required.
