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
  {
    route: "/delivery-varanda-ype-campinas",
    file: path.join("delivery-varanda-ype-campinas", "index.html"),
    title: "Delivery Varanda Ypê em Campinas | 99Food, iFood e pedidos",
    description:
      "Encontre o Varanda Ypê nos apps e buscas: delivery em Campinas, 99Food, iFood, Expresso, WhatsApp, endereço no Jardim Aurélia e nome sem acento Varanda Ype.",
    canonical: "https://varandaype.com/delivery-varanda-ype-campinas",
  },
  {
    route: "/restaurante-jardim-aurelia", file: path.join("restaurante-jardim-aurelia", "index.html"),
    title: "Restaurante no Jardim Aurélia, Campinas | Varanda Ypê",
    description: "Restaurante no Jardim Aurélia, em Campinas, com comida brasileira, almoço, jantar, porções, espetinhos, espaço kids e delivery.",
    canonical: "https://varandaype.com/restaurante-jardim-aurelia",
  },
  {
    route: "/almoco-jardim-aurelia", file: path.join("almoco-jardim-aurelia", "index.html"),
    title: "Almoço no Jardim Aurélia, Campinas | Varanda Ypê",
    description: "Almoço no Jardim Aurélia com grelhados, massas, risotos, pratos para a família, marmitaria e atendimento para empresas.",
    canonical: "https://varandaype.com/almoco-jardim-aurelia",
  },
  {
    route: "/restaurante-com-espaco-kids-campinas", file: path.join("restaurante-com-espaco-kids-campinas", "index.html"),
    title: "Restaurante com espaço kids reformado em Campinas | Varanda Ypê",
    description: "Restaurante com espaço kids no Jardim Aurélia, em Campinas. Brinquedão reformado em 2026, comida brasileira, pratos kids, almoço, jantar e ambiente familiar.",
    canonical: "https://varandaype.com/restaurante-com-espaco-kids-campinas",
  },
  {
    route: "/porcoes-chopp-jardim-aurelia", file: path.join("porcoes-chopp-jardim-aurelia", "index.html"),
    title: "Porções e chopp no Jardim Aurélia | Varanda Ypê",
    description: "Porções, espetinhos, chopp e bebidas no Jardim Aurélia, em Campinas. Consulte o cardápio e venha jantar no Varanda Ypê.",
    canonical: "https://varandaype.com/porcoes-chopp-jardim-aurelia",
  },
];

function pageForProduct(product) {
  return {
    route: `/${product.slug}`,
    file: path.join(product.slug, "index.html"),
    title: product.metaTitle || `${product.eyebrow} em Campinas | Varanda Ypê`,
    description: product.metaDescription || product.intro,
    canonical: `https://varandaype.com/${product.slug}/`,
  };
}

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

function stripRootPreloads(markup) {
  return markup.replace(/(?:<link\s+rel="preload"\s+as="image"[^>]*\/>)+/g, "");
}

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

try {
  const template = await fs.readFile(templatePath, "utf8");
  const { default: App, productPages } = await vite.ssrLoadModule("/src/App.jsx");

  for (const page of [...pages, ...productPages.map(pageForProduct)]) {
    const markup = stripRootPreloads(
      renderToString(React.createElement(App, { initialPath: page.route })),
    );
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
