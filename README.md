Lívia Maschietto Boneti - 24000749-2 Maria Eduarda Bellarmino Duarte 24036202-2

# 1. Introdução
Atividade de testes para uma partida de Dominó entre dois jogadores, usando um conjunto duplo-seis. A implementação cobre distribuição das peças, encaixes nas extremidades, compra, passes, bloqueio e vitória.
Regras adotadas: cada jogador recebe sete peças; as restantes ficam para compra. Se a partida bloquear, vence quem tiver menos pontos nas peças da mão; pontuações iguais dão empate.
# 2. Regras de negócio
# RN01 — Conjunto: usar 28 peças únicas, do duplo-zero ao duplo-seis.

# RN02 — Distribuição: entregar sete peças a cada jogador e reservar as demais para compra.

# RN03 — Encaixe: uma peça jogada deve combinar com uma das extremidades da cadeia.

# RN04 — Orientação: posicionar a peça com o lado correspondente encostado à extremidade escolhida.

# RN05 — Turnos: somente o jogador da vez pode jogar, comprar ou passar.

# RN06 — Compra: se não houver jogada possível, comprar uma peça enquanto houver peças na reserva.

# RN07 — Vitória: vence quem esvaziar a mão primeiro.

# RN08 — Bloqueio: quando os dois jogadores passarem sem jogadas e sem peças para comprar, vence quem tiver menos pontos na mão; empate de pontos encerra em empate.
# 3. Casos de teste
# CT01 — Criar conjunto duplo-seis com 28 peças únicas.

# CT02 — Distribuir sete peças por jogador e manter 14 para compra.

# CT03 — Abrir a cadeia com a primeira peça e passar a vez.

# CT04 — Encaixar à direita, invertendo a orientação quando necessário.

# CT05 — Encaixar à esquerda com a orientação correta.

# CT06 — Identificar as extremidades em que uma peça pode ser jogada.

# CT07 — Rejeitar peça que não combina com a cadeia.

# CT08 — Rejeitar jogada fora da vez ou peça que não pertence à mão.

# CT09 — Permitir compra quando não há encaixe e ainda existe reserva.

# CT10 — Rejeitar compra se houver jogada possível.

CT11 — Declarar vencedor quando um jogador esvaziar a mão.

CT12 — Resolver bloqueio pelo menor total de pontos.

CT13 — Declarar empate se os pontos das mãos forem iguais.
Resultado: 13 testes passaram.
