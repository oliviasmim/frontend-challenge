# DIFERENCAS — OpenSpec vs. cenários escritos à mão

Feature: `catalog-url-state` (OpenSpec, validada com `openspec validate`).

1. **Acrescentou:** requisito de estado vazio/falha ("Limpar filtros", "Tentar novamente") e `design.md` com cancelamento de respostas obsoletas, que não estavam nos 3 cenários originais.
2. **Mudou:** os números dos cenários não batiam com as fixtures (Fotografia "12 NFTs"; faixa 11–12,30 ETH) — foram ajustados para 4 NFTs e 12,00–12,30 ETH ao implementar.
3. **Pergunta:** não fez pergunta nenhuma (a change foi redigida em uma passada, sem diálogo).

## OpenSpec × TLC

**Pendente:** a instalação do TLC (`npx @tech-leads-club/agent-skills install -s tlc-spec-driven -a claude-code`) foi bloqueada pelo modo automático do Claude Code por executar código externo; precisa ser rodada pela pessoa autora (`! npx ...`). Depois, repetir `catalog-url-state` em `.specs/features/` e preencher aqui o parágrafo comparativo (qual perguntou mais, qual inventou mais, qual usar).
