# Fluxo seguro do OpenCode

Esta configuração vive em `AGENTS.md`, `opencode.jsonc`,
`.opencode/agents/` e `.opencode/commands/`. `CLAUDE.md` e a configuração legada
em `.claude/` foram preservados.

## Agentes e modelos

- `orchestrator`: coordena e verifica; `opencode-go/gpt-6-luna`.
- `explorer`: somente leitura; `opencode-go/space-bunny-free#low`.
- `implementer`: menor alteração autorizada; `opencode-go/gpt-6-luna`.
- `e2e`: Playwright e QA controlado, sem edição; `opencode-go/space-bunny-free#low`.
- `visual-qa`: screenshots e análise visual, sem edição; `opencode-go/space-bunny-free#low`.
- `reviewer`: revisão somente leitura; `opencode-go/space-bunny-free#low`.

O catálogo Go consultado não continha `opencode-go/gpt-5.6-luna`; a configuração
usa o modelo Luna disponível `opencode-go/gpt-6-luna` para as funções principais.
O modelo econômico foi escolhido entre as opções gratuitas disponíveis. A
capacidade de visão não é exposta pelo catálogo consultado; `visual-qa` deve
reportar a limitação se a execução não aceitar imagens.

## Comandos

- `/task <issue>`: ciclo completo com escopo controlado.
- `/plan-task <issue>`: investigação e plano, sem código de produto.
- `/verify [escopo]`: revisão somente leitura.
- `/e2e [spec ou fluxo]`: E2E Playwright com mock.
- `/visual-check [rota ou fluxo]`: screenshots antes/depois.
- `/ralph <issue>`: até cinco ciclos guiados de implementação e validação.

## Permissões e Git

Agentes de leitura e QA têm `edit` negado. O implementador recebe `edit: ask`,
portanto a edição precisa de aprovação e deve coincidir com o escopo da issue.
Shell é negado por padrão nesses agentes, com exceções para inspeção Git e
comandos de build/teste. Push, merge, deploy, reset, clean, checkout, restore e
rebase são bloqueados no projeto. A configuração não concede acesso a arquivos
de ambiente com segredos.

O fluxo é: estado inicial Git → investigação → plano/clareza → implementação
mínima → verificações → E2E/visual quando aplicável → revisão do diff. Commit
exige decisão explícita; push, merge e deploy dependem sempre de ação humana.

## E2E e QA visual

Reutilize `next-app/playwright.config.js`: app em 3100, GitHub Pages mock em
3200 e timeout de startup frio de 600000 ms. Use `--workers=1` para a suíte
completa, somente mock e nunca altere baselines automaticamente. Screenshots e
falhas devem ser reportados pelos caminhos dos artefatos.

## Ralph Loop e limites humanos

Não foi encontrada implementação nativa, plugin ou comando Ralph existente. O
`/ralph` é um comando local reversível que coordena o ciclo por instruções, com
limite padrão de cinco iterações; ele não tenta controlar o runtime do OpenCode.
Pare para decisão humana diante de escopo ambíguo, arquivo protegido, API real,
teste essencial indisponível, alteração inesperada ou risco de destruir trabalho.
