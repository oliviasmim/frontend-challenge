---
name: kurio-spec-driven
description: Fluxo spec-driven do marketplace Kurio. Use ao iniciar qualquer feature ou correção de comportamento — exige glossário, spec (OpenSpec) e cenários BDD antes do código.
---

# Fluxo spec-driven (Kurio)

1. **Glossário primeiro.** Leia `GLOSSARIO.md`. Use os termos exatos e a pasta do contexto (`apps/web/src/catalog/` ou `purchase/`). Termo novo ⇒ atualize o glossário e `openspec/config.yaml`.
2. **Cada requisito aponta uma frase do `README.md`** (seção §). Sem origem, não entra.
3. **Spec antes do código.** Mudança de comportamento ⇒ `openspec new change <nome>`, escrever proposal/design/specs/tasks em pt-BR (cabeçalhos e SHALL/MUST em inglês) e rodar `openspec validate <nome>`.
4. **Research → Plan → Implement em sessões separadas**, cada uma recebendo só o artefato da anterior (`RESEARCH.md` → `docs/adr/` + `docs/<slug>-spec.md` → código). RESEARCH não cita tecnologia.
5. **Critérios EARS** (ubíquo, evento, estado, indesejado, opcional) + ao menos 1 cenário BDD de erro/limite.
6. **Cenário BDD = teste Playwright** em `apps/web/e2e/`, com o texto Dado/Quando/Então como comentário.
7. Rodar `npm run typecheck && npm run test:e2e && npm run validate:specs` antes de concluir.
