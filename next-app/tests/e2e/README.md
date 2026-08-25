# E2E tests

Rodados por `npm run test:e2e` (Playwright) e pelo comando `/resolve-issue`.

Um spec por issue resolvida, nomeado pela issue (`issue-2-reagendar-48h.spec.js`), cobrindo especificamente o comportamento que a issue pedia — não é uma suíte de regressão genérica do app inteiro. Fica no repositório como validação permanente: se algo quebrar essa regra de novo depois, o teste falha.
