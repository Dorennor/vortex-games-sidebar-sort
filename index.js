const { log } = require('vortex-api');

// The games in the left sidebar are drawn in the order of state.session.gameMode.known,
// which is the order in which game extensions registered. That list is only set by core
// Vortex's game-mode manager, through its SET_KNOWN_GAMES action.
//
// That action creator isn't exported through vortex-api, so this extension dispatches the
// plain action. redux-act keeps an all-caps description such as SET_KNOWN_GAMES as the
// literal action type, which is also what lets Vortex sync actions between its processes,
// so the core reducer handles it as it handles its own.
const SET_KNOWN_GAMES = 'SET_KNOWN_GAMES';
const KNOWN_GAMES_PATH = ['session', 'gameMode', 'known'];

// "S.T.A.L.K.E.R.: Clear Sky" sorts as "STALKER Clear Sky", and "Game 2" before "Game 10".
const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true, ignorePunctuation: true });

// Same as the sidebar's own display name: whitespace collapsed and trimmed.
function displayName(game) {
  return (game?.name ?? game?.id ?? '').replace(/\s+/g, ' ').trim();
}

function compareGames(lhs, rhs) {
  // The id breaks ties so that two games with the same name keep a stable order.
  return collator.compare(displayName(lhs), displayName(rhs))
    || collator.compare(String(lhs?.id ?? ''), String(rhs?.id ?? ''));
}

function isSorted(games) {
  for (let i = 1; i < games.length; i++) {
    if (compareGames(games[i - 1], games[i]) > 0) {
      return false;
    }
  }
  return true;
}

function sortKnownGames(api) {
  const known = api.getState().session?.gameMode?.known;
  if (!Array.isArray(known) || known.length < 2 || isSorted(known)) {
    return;
  }
  // A new array holding the same game objects; nothing else about them changes.
  api.store.dispatch({ type: SET_KNOWN_GAMES, payload: [...known].sort(compareGames) });
}

function main(context) {
  context.once(() => {
    const trySort = () => {
      try {
        sortKnownGames(context.api);
      } catch (err) {
        log('warn', 'games-sidebar-sort: failed to sort the games list', { error: err.message });
      }
    };

    // Re-sorts whenever Vortex replaces the list, e.g. when a game extension is added.
    // The dispatch above triggers this once more, and then the list is already sorted.
    context.api.onStateChange(KNOWN_GAMES_PATH, trySort);
    trySort();
  });

  return true;
}

module.exports = { default: main };
