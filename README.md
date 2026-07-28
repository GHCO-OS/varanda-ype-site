# Varanda Ype Website

Site institucional do restaurante Varanda Ype, publicado em Cloudflare Pages.

## Publicacao

- Dominio principal: https://varandaype.com
- Cloudflare Pages: https://varanda-ype.pages.dev
- Projeto Cloudflare Pages: `varanda-ype`

## Rotas

- `/` - pagina inicial
- `/menu` - cardapio e destaques
- `/empresa` - servicos para empresas

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

O build gera os arquivos estaticos em `dist/` e roda o prerender das paginas principais para SEO.

## SEO

- `public/sitemap.xml`
- `public/robots.txt`
- prerender em `scripts/prerender.mjs`

## Deploy

O deploy atual foi feito no Cloudflare Pages a partir do build local:

```bash
npm run build
npx wrangler pages deploy dist --project-name varanda-ype --branch main --commit-dirty=true
```

O dominio `varandaype.com` esta apontado para o projeto Cloudflare Pages.
