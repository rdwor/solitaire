# Solitaire — Draw Three

A responsive, dependency-free Klondike game for GitHub Pages. Hard mode uses three-card draws, only the top waste card playable, and unlimited stock passes. Deals use a uniform Fisher–Yates shuffle and are not guaranteed winnable. This matches the draw-three style of Google's hard mode; Google's deal generator and exact win rate are not reproduced.

## Play locally

Open `index.html` in a browser. No install or build is needed.

## Publish on GitHub

1. Create a public repository named `solitaire`.
2. Upload `index.html`, `style.css`, `engine.js`, and `app.js` to the repository root.
3. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/(root)**. Save.
4. GitHub will display the live URL, normally `https://YOUR-USERNAME.github.io/solitaire/`.

Keep this separate from an existing portfolio repository. It can be linked from your portfolio once published.

## Controls

- Click or tap a card, then click or tap its destination.
- Drag cards on desktop; double-click a top card to send it to a foundation.
- Undo, hints, restart the same deal, or deal a new game.
- Tab / Enter navigate controls. Space with the page focused draws. Ctrl / Command + Z undoes. Escape clears the selection.

Hints show legal forward moves and prioritize revealing hidden cards. They are not a solver. Foundation cards can be moved back to the tableau.

## Verify

Run `node --test tests/engine.test.cjs`.

No external fonts, libraries, analytics, or network requests are required to play.
