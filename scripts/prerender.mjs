import fs from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const root = process.cwd();
const distDir = path.join(root, "dist");
const templatePath = path.join(distDir, "index.html");

const pages = [
  {
    route: "/",
    file: "index.html",
    title: "Varanda Ypê | Restaurante no Jardim Aurélia, Campinas",
    description:
      "Restaurante Varanda Ypê em Campinas, no Jardim Aurélia. Comida brasileira, pratos executivos, espetinhos, chopp, porções e espaço kids.",
    canonical: "https://varandaype.com/",
  },
  {
    route: "/menu",
    file: path.join("menu", "index.html"),
    title: "Cardápio Varanda Ypê | Pratos, espetinhos, porções e bebidas",
    description:
      "Cardápio do Varanda Ypê em Campinas com pratos executivos, grelhados, espetinhos, porções, chopp, bebidas e opções kids.",
    canonical: "https://varandaype.com/menu",
  },
  {
    route: "/empresa",
    file: path.join("empresa", "index.html"),
    title: "Varanda Ypê para Empresas | Refeições corporativas em Campinas",
    description:
      "Pedidos para empresas no Varanda Ypê em Campinas: almoço para equipes, reuniões, volume sob consulta, pratos executivos, porções e chopp.",
    canonical: "https://varandaype.com/empresa",
  },
];

function applyHead(html, page) {
  return html
    .replace(/<title>.*?<\/title>/s, `<title>${page.title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/>/s,
      `<meta name="description" content="${page.description}" />`,
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/s,
      `<link rel="canonical" href="${page.canonical}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:title" content="${page.title}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:description" content="${page.description}" />`,
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/s,
      `<meta property="og:url" content="${page.canonical}" />`,
    );
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const template = await fs.readFile(templatePath, "utf8");
  const { default: App } = await vite.ssrLoadModule("/src/App.jsx");

  for (const page of pages) {
    const markup = renderToString(React.createElement(App, { initialPath: page.route }));
    const html = applyHead(template, page).replace(
      '<div id="root"></div>',
      `<div id="root">${markup}</div>`,
    );
    const outputPath = path.join(distDir, page.file);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html);
  }
} finally {
  await vite.close();
}
