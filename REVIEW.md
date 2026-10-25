# REVIEW

**Aviso de processo:** Research, Plan e Implement foram feitos na mesma sessão do agente, não em três sessões isoladas como pede o roteiro. Os artefatos foram escritos em sequência, cada um só com o anterior como fonte, mas o isolamento não foi real.

## Pedido ao agente (Plan)
Pedido: ADR + spec enxuta (5 EARS, 3 BDD) para "pedido duplicado no pagamento" a partir do `RESEARCH.md`.

## O que foi devolvido e o que foi reescrito
- **EARS 1:** a origem apontava seção inexistente; reescrita para RESEARCH §2 → README §5.
- **BDD:** cenário 3 (conflito) foi tornado verificável na API (fetch via MSW) porque a UI não deixa trocar a quantidade com a mesma chave.
- Números alinhados às fixtures e à taxa de 2% do mock (1.19 → 1.2138 ETH).
- Descartado: deduplicar por conteúdo no servidor (bloqueia recompra legítima).

## Pendências
TLC não instalado (ver DIFERENCAS.md); PR não aberto; testes cobrem só os cenários desta fatia.
