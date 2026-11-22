export const PLAYER_COUNT = 2;
export const HAND_SIZE = 7;

function randomUnit(rng) {
  const value = Number(rng());
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 0.999999999) : 0;
}

export function createDeck() {
  const deck = [];
  for (let left = 0; left <= 6; left += 1) {
    for (let right = left; right <= 6; right += 1) {
      deck.push({ id: `${left}-${right}`, left, right });
    }
  }
  return deck;
}

export function createGame({ rng = Math.random } = {}) {
  if (typeof rng !== "function") throw new TypeError("rng deve ser uma função.");
  const deck = createDeck();
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(randomUnit(rng) * (index + 1));
    [deck[index], deck[swap]] = [deck[swap], deck[index]];
  }
  return {
    players: [{ id: 0, hand: deck.slice(0, HAND_SIZE) }, { id: 1, hand: deck.slice(HAND_SIZE, HAND_SIZE * 2) }],
    boneyard: deck.slice(HAND_SIZE * 2),
    chain: [],
    currentPlayer: 0,
    consecutivePasses: 0,
    status: "playing",
    winner: null,
    result: null,
  };
}

export function handPips(hand) {
  return hand.reduce((total, tile) => total + tile.left + tile.right, 0);
}

export function getPlayableEnds(game, playerIndex = game.currentPlayer, tileId) {
  const player = game.players[playerIndex];
  if (!player) return [];
  const tile = player.hand.find((candidate) => candidate.id === tileId);
  if (!tile) return [];
  if (game.chain.length === 0) return ["right"];
  const ends = [];
  const leftEnd = game.chain[0].left;
  const rightEnd = game.chain[game.chain.length - 1].right;
  if (tile.left === leftEnd || tile.right === leftEnd) ends.push("left");
  if (tile.left === rightEnd || tile.right === rightEnd) ends.push("right");
  return ends;
}

function finishGame(game, winner, result) {
  game.status = result;
  game.winner = winner;
  game.result = result;
}

export function playTile(game, playerIndex, tileId, end = "right") {
  if (game.status !== "playing") throw new Error("A partida já terminou.");
  if (playerIndex !== game.currentPlayer) throw new Error("Não é a vez deste jogador.");
  if (end !== "left" && end !== "right") throw new RangeError("A extremidade deve ser left ou right.");
  const player = game.players[playerIndex];
  const tileIndex = player.hand.findIndex((tile) => tile.id === tileId);
  if (tileIndex === -1) throw new Error("A peça não está na mão do jogador.");
  const tile = player.hand[tileIndex];
  if (game.chain.length > 0 && !getPlayableEnds(game, playerIndex, tileId).includes(end)) {
    throw new Error("A peça não combina com essa extremidade da cadeia.");
  }

  let placed;
  if (game.chain.length === 0) {
    placed = { left: tile.left, right: tile.right, tileId: tile.id };
  } else if (end === "right") {
    const match = game.chain[game.chain.length - 1].right;
    placed = tile.left === match
      ? { left: tile.left, right: tile.right, tileId: tile.id }
      : { left: tile.right, right: tile.left, tileId: tile.id };
    game.chain.push(placed);
  } else {
    const match = game.chain[0].left;
    placed = tile.right === match
      ? { left: tile.left, right: tile.right, tileId: tile.id }
      : { left: tile.right, right: tile.left, tileId: tile.id };
    game.chain.unshift(placed);
  }
  if (game.chain.length === 0) game.chain.push(placed);
  player.hand.splice(tileIndex, 1);
  game.consecutivePasses = 0;

  if (player.hand.length === 0) finishGame(game, playerIndex, "won");
  else game.currentPlayer = 1 - playerIndex;
  return placed;
}

export function drawTile(game, playerIndex) {
  if (game.status !== "playing") throw new Error("A partida já terminou.");
  if (playerIndex !== game.currentPlayer) throw new Error("Não é a vez deste jogador.");
  if (game.chain.length === 0) throw new Error("A primeira jogada deve ser feita antes de comprar.");
  if (game.boneyard.length === 0) throw new Error("Não há mais peças para comprar.");
  const playable = game.players[playerIndex].hand.some((tile) => getPlayableEnds(game, playerIndex, tile.id).length > 0);
  if (playable) throw new Error("O jogador tem uma jogada possível e não precisa comprar.");
  const tile = game.boneyard.shift();
  game.players[playerIndex].hand.push(tile);
  return tile;
}

export function passTurn(game, playerIndex) {
  if (game.status !== "playing") throw new Error("A partida já terminou.");
  if (playerIndex !== game.currentPlayer) throw new Error("Não é a vez deste jogador.");
  if (game.chain.length === 0) throw new Error("Não é possível passar antes da primeira jogada.");
  const hasPlayable = game.players[playerIndex].hand.some((tile) => getPlayableEnds(game, playerIndex, tile.id).length > 0);
  if (hasPlayable) throw new Error("Há uma peça que pode ser jogada.");
  if (game.boneyard.length > 0) throw new Error("Ainda há peças para comprar.");
  game.consecutivePasses += 1;
  if (game.consecutivePasses >= PLAYER_COUNT) {
    const pips = game.players.map((player) => handPips(player.hand));
    if (pips[0] < pips[1]) finishGame(game, 0, "blocked");
    else if (pips[1] < pips[0]) finishGame(game, 1, "blocked");
    else finishGame(game, null, "draw");
  } else {
    game.currentPlayer = 1 - playerIndex;
  }
  return { status: game.status, winner: game.winner };
}
