# DIFERENCAS.md: feature `filtros-catalogo-na-url` (contexto Catálogo)

Meus cenários: `docs/semana5/cenarios-a-mao.md`, commitados antes de abrir o agente. Saída do
OpenSpec 2.1.0: `openspec/changes/filtros-catalogo-na-url/`. `openspec validate` → `Change 'filtros-catalogo-na-url' is valid`.

1. **Acrescentou:** uma regra que eu não escrevi. "Cada mudança de estado do Catálogo SHALL gerar uma entrada no histórico" e "a busca de texto só vai para a URL quando o colecionador envia (Enter), não a cada tecla". A segunda é decisão de UX que ele tomou sozinho, mas avisou.
2. **Mudou nos meus cenários:** nada no conteúdo. Os 3 cenários entraram literalmente, só com `Dado/Quando/Então` virando `GIVEN/WHEN/THEN`. Ele também separou um *Requirement* por cenário e generalizou cada um ("MUST combinar o novo filtro com os filtros já ativos").
3. **Perguntou:** duas coisas antes de criar qualquer arquivo. (a) Como cumprir "mexa só em `src/catalogo/`" se ainda não existe app nenhum? Opções: change de fundação separada, quebrar a cerca, ou bloquear os testes. (b) O README §3 também pede resultado vazio, falha de API, resposta fora de ordem e URL inválida, que meus cenários não cobrem: deixar fora ou eu escrever cenário? Respondi "fundação separada + deixar fora", que foi a recomendação dele.

## Mesma feature no TLC (faixa completa)

Saída: `.specs/features/filtros-catalogo-na-url/spec.md` (skill `tlc-spec-driven`, glossário no fim do
`CLAUDE.md`). **Não rodei o `validate_spec.py`**: esta máquina não tem Python. O agente conferiu as
regras do script lendo o código e reportou um único aviso esperado (perguntas abertas bloqueiam a aprovação).

**OpenSpec x TLC.** O **TLC perguntou mais**: fez 7 perguntas, contra 2 do OpenSpec. Uma delas pegou um furo real nos meus
cenários: sem tratar respostas fora de ordem, voltar para "Arte" pode mostrar a lista de "Música".
Outra notou que a minha regra só reinicia a página para Filtro, não para busca e ordenação. O **OpenSpec inventou
mais**. Ele resolveu sozinho o momento da busca, o histórico e os nomes dos parâmetros e
entregou proposal, design e tasks prontos. Ele avisou o que decidiu, mas decidiu. O TLC transformou os 3 cenários
em 10 critérios EARS rastreáveis (`CATURL-01..10`) e deixou as decisões abertas como pergunta. Neste projeto eu
usaria o **OpenSpec** para o fluxo do dia a dia: valida com um comando sem depender de Python, e o
`tasks.md` já vira roteiro de implementação. Antes, eu passaria a feature pelo TLC quando o README é ambíguo, porque as perguntas
dele mostram o que o enunciado não decide.
