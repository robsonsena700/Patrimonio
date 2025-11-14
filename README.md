# IS-Pat – Sistema de Patrimônio (Híbrido Windows/Linux)

Aplicação full-stack para gestão de patrimônio: React + Vite (frontend) e Express + TypeScript (backend), com PostgreSQL.

## Requisitos
- Node.js 18+ (recomendado 20+)
- npm
- Acesso a um servidor PostgreSQL

## Configuração de Ambiente
Crie um arquivo `.env` na raiz baseado em `.env.example`:

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=false
PORT=5000
```

## Instalação
```
npm install
```

## Desenvolvimento (Windows/Linux)
```
npm run dev
```
Acesse `http://localhost:5000/`.

## Produção (Windows/Linux)
```
npm run build
npm start
```

## Estrutura
- `client/` – frontend React/Vite
- `server/` – backend Express/TypeScript
- `uploads/` – imagens enviadas (não versionadas)
- `dist/public/` – build do frontend
- `server/dist/server/` – build do backend

## Endpoints úteis
- `GET /api/health` – saúde da aplicação
- `GET /api/health/db` – conexão ao banco

## CI/CD
GitHub Actions: build e typecheck em `ubuntu-latest` e `windows-latest` (`.github/workflows/ci.yml`).

## Licença
MIT. Veja `LICENSE`.

## Boas Práticas
- Não versionar `.env`, `uploads/`, `dist/` e `server/dist/`
- Mensagens de commit descritivas
- Variáveis de ambiente somente em `.env`