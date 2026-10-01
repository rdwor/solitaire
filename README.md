# Solitaire — Draw Three

A responsive, dependency-free Klondike game for GitHub Pages. Hard mode uses three-card draws, only the top waste card playable, and unlimited stock passes. Deals use a uniform Fisher–Yates shuffle and are not guaranteed winnable. This matches the draw-three style of Google's hard mode; Google's deal generator and exact win rate are not reproduced.

## Play locally

Open `index.html` in a browser. No install or build is needed.

## Controls

- Click or tap a card, then click or tap its destination.
- Drag cards on desktop; double-click a top card to send it to a foundation.
- Undo, hints, restart the same deal, or deal a new game.
- Tab / Enter navigate controls. Space with the page focused draws. Ctrl / Command + Z undoes. Escape clears the selection.

Hints show legal forward moves and prioritize revealing hidden cards. They are not a solver. Foundation cards can be moved back to the tableau.

## Verify

Run `node --test tests/engine.test.cjs`.

No external fonts, libraries, analytics, or network requests are required to play.
