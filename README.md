# Sort Games Alphabetically

A Vortex extension that keeps the games in the left sidebar sorted alphabetically by name. It doesn't depend on any other extension.

## Install

1. Close Vortex.
2. Double-click `install.bat`. It copies `info.json` and `index.js` to `%APPDATA%\Vortex\plugins\Sort Games Alphabetically\`. Run it again after changing the code; it replaces the old files.
3. Start Vortex. **Sort Games Alphabetically** should appear on the Extensions page, enabled, and the sidebar should be sorted.

To uninstall, remove it from the Extensions page, or delete that folder while Vortex is closed. The sidebar goes back to Vortex's own order on the next start.

## How it sorts

- By the name the sidebar shows, ignoring case and punctuation: `S.T.A.L.K.E.R.: Clear Sky` sorts as `STALKER Clear Sky`.
- Numbers compare as numbers: `Game 2` comes before `Game 10`.
- A leading "The" counts: `The Witcher 3` sorts under T.

It keeps the list sorted when Vortex changes it, for example when you add a game.

## How it works

The sidebar draws games in the order of Vortex's list of known games (`state.session.gameMode.known`). Vortex fills that list in the order game extensions register, which is why the sidebar looks random.

When Vortex starts, and whenever that list changes, the extension checks whether it is sorted. If it isn't, it dispatches Vortex's own `SET_KNOWN_GAMES` action with the same games in alphabetical order. Nothing else about the games changes, and nothing is saved to disk: the list only exists while Vortex runs, so uninstalling the extension leaves nothing behind.

The `SET_KNOWN_GAMES` action creator isn't exported through `vortex-api`, so the extension dispatches the plain action. Vortex builds its actions with redux-act, which keeps an all-caps name like `SET_KNOWN_GAMES` as the literal action type, so the core reducer handles it like Vortex's own.

## If it stops working

A future Vortex version may rename this action or draw the sidebar from a different list. The extension then does nothing: the sidebar keeps Vortex's order and nothing breaks. Any error is written to the Vortex log as a `games-sidebar-sort` warning.
