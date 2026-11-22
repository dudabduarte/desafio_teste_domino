import { createDeck, createGame, drawTile, getPlayableEnds, handPips, passTurn, playTile } from "./domino.js";

function expect(condition, message) { if (!condition) throw new Error(message); }
function throws(action, message) { let error; try { action(); } catch (caught) { error = caught; } if (!error) throw new Error(message); }

function fixture({ hand0 = [], hand1 = [], boneyard = [], chain = [], currentPlayer = 0 } = {}) {
  const game = createGame({ rng: () => 0.5 });
  game.players[0].hand = hand0.map(([left, right]) => ({ id: `${left}-${right}`, left, right }));
  game.players[1].hand = hand1.map(([left, right]) => ({ id: `${left}-${right}`, left, right }));
  game.boneyard = boneyard.map(([left, right]) => ({ id: `${left}-${right}`, left, right }));
  game.chain = chain.map(([left, right]) => ({ left, right, tileId: `${left}-${right}` }));
  game.currentPlayer = currentPlayer;
  game.status = "playing";
  return game;
}

export const DOMINO_TESTS = [
  { title: "Cria conjunto duplo-seis com 28 peças únicas", run() { const deck = createDeck(); expect(deck.length === 28, "O conjunto deve ter 28 peças."); expect(new Set(deck.map((tile) => tile.id)).size === 28, "Todas as peças devem ser únicas."); expect(deck.some((tile) => tile.left === 6 && tile.right === 6), "O duplo-seis deve existir."); } },
  { title: "Distribui sete peças para cada jogador e deixa 14 para compra", run() { const game = createGame({ rng: () => 0.25 }); expect(game.players.length === 2, "A partida deve ter dois jogadores."); expect(game.players.every((player) => player.hand.length === 7), "Cada jogador recebe sete peças."); expect(game.boneyard.length === 14, "Devem restar 14 peças para compra."); expect(new Set([...game.players.flatMap((player) => player.hand), ...game.boneyard].map((tile) => tile.id)).size === 28, "Nenhuma peça pode ser duplicada ou perdida."); } },
  { title: "Abre a cadeia com a primeira peça", run() { const game = fixture({ hand0: [[1, 4], [0, 0]], hand1: [[2, 4]] }); playTile(game, 0, "1-4"); expect(game.chain.length === 1 && game.chain[0].left === 1 && game.chain[0].right === 4, "A primeira peça inicia a cadeia."); expect(game.currentPlayer === 1, "A vez passa ao outro jogador."); } },
  { title: "Encaixa peça à direita e inverte sua orientação quando necessário", run() { const game = fixture({ hand0: [[2, 5]], hand1: [[3, 5]], chain: [[1, 2]], currentPlayer: 0 }); playTile(game, 0, "2-5", "right"); expect(game.chain[1].left === 2 && game.chain[1].right === 5, "O lado conectado deve ficar voltado para a cadeia."); } },
  { title: "Encaixa peça à esquerda e orienta os valores corretamente", run() { const game = fixture({ hand0: [[2, 5]], hand1: [[3, 5]], chain: [[5, 6]], currentPlayer: 0 }); playTile(game, 0, "2-5", "left"); expect(game.chain[0].left === 2 && game.chain[0].right === 5, "O lado conectado deve encostar no extremo esquerdo."); } },
  { title: "Lista extremidades jogáveis de uma peça", run() { const game = fixture({ hand0: [[2, 5], [4, 4]], chain: [[2, 3], [4, 5]] }); expect(getPlayableEnds(game, 0, "2-5").sort().join(",") === "left,right", "A peça pode encaixar nas duas pontas."); expect(getPlayableEnds(game, 0, "4-4").length === 0, "O duplo quatro não encaixa."); } },
  { title: "Rejeita jogada que não combina", run() { const game = fixture({ hand0: [[4, 5]], chain: [[1, 2]] }); throws(() => playTile(game, 0, "4-5"), "Peça incompatível deve ser rejeitada."); expect(game.players[0].hand.length === 1, "A mão deve permanecer inalterada."); } },
  { title: "Impede jogada fora da vez ou peça que não está na mão", run() { const game = fixture({ hand0: [[2, 3]], hand1: [[4, 5]], chain: [[1, 2]] }); throws(() => playTile(game, 1, "4-5"), "Não é a vez do jogador 2."); throws(() => playTile(game, 0, "6-6"), "Não se pode jogar peça alheia à mão."); } },
  { title: "Compra peça quando não há encaixe e ainda existe reserva", run() { const game = fixture({ hand0: [[4, 5]], chain: [[1, 2]], boneyard: [[2, 6]] }); const tile = drawTile(game, 0); expect(tile.id === "2-6", "A peça do topo da reserva deve ser comprada."); expect(game.players[0].hand.length === 2 && game.boneyard.length === 0, "A mão e a reserva devem ser atualizadas."); } },
  { title: "Não permite comprar se existe jogada possível", run() { const game = fixture({ hand0: [[2, 5]], chain: [[1, 2]], boneyard: [[3, 4]] }); throws(() => drawTile(game, 0), "Não deve comprar quando já pode jogar."); } },
  { title: "Declara vencedor ao esvaziar a mão", run() { const game = fixture({ hand0: [[2, 3]], hand1: [[6, 6]], chain: [[1, 2]] }); playTile(game, 0, "2-3", "right"); expect(game.status === "won" && game.winner === 0, "O primeiro jogador sem peças vence."); } },
  { title: "Resolve bloqueio pelo menor total de pontos", run() { const game = fixture({ hand0: [[0, 0], [0, 1]], hand1: [[6, 6]], chain: [[2, 3]], currentPlayer: 0 }); passTurn(game, 0); passTurn(game, 1); expect(game.status === "blocked" && game.winner === 0, "No bloqueio vence a menor soma de pontos."); expect(handPips(game.players[0].hand) === 1, "A mão do jogador 1 soma um ponto."); } },
  { title: "Declara empate se o bloqueio deixa a mesma pontuação", run() { const game = fixture({ hand0: [[1, 1]], hand1: [[0, 2]], chain: [[3, 4]], currentPlayer: 0 }); passTurn(game, 0); passTurn(game, 1); expect(game.status === "draw" && game.winner === null, "Pontuações iguais resultam em empate."); } },
];
