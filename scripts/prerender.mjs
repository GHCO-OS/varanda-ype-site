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
      "Restaurante Varanda Ypê no Jardim Aurélia, Campinas. Reserve sua mesa para almoço, jantar e encontros em família. Espaço kids, delivery e marmitaria.",
    canonical: "https://varandaype.com/",
    preload: {
      srcset: "/pratos/chorizo-sm.webp 420w, /pratos/chorizo.webp 600w",
      sizes: "(max-width: 640px) 420px, 600px",
    },
  },
  {
    route: "/menu",
    file: path.join("menu", "index.html"),
    title: "Cardápio Varanda Ypê | Marmitas, executivos e grelhados",
    description:
      "Cardápio do Varanda Ypê em Campinas com marmitas, pratos executivos, grelhados, espetinhos, porções, bebidas e opções kids.",
    canonical: "https://varandaype.com/menu/",
  },
  {
    route: "/empresa",
    file: path.join("empresa", "index.html"),
    title: "Varanda Ypê para Empresas | Refeições corporativas em Campinas",
    description:
      "Pedidos para empresas no Varanda Ypê em Campinas: almoço para equipes, reuniões, volume sob consulta, pratos executivos, porções e chopp.",
    canonical: "https://varandaype.com/empresa/",
    preload: {
      srcset: "/pratos/fraldinha-sm.webp 420w, /pratos/fraldinha.webp 600w",
      sizes: "(max-width: 640px) 420px, 600px",
    },
  },
  {
    route: "/delivery",
    file: path.join("delivery", "index.html"),
    title: "Delivery Varanda Ypê | iFood, 99Food e pedido direto",
    description:
      "Escolha o canal oficial para pedir Varanda Ypê ou Burgers N' Smoke em Campinas: iFood, 99Food, pedido direto e WhatsApp.",
    canonical: "https://varandaype.com/delivery/",
  },
  {
    route: "/delivery-varanda-ype-campinas",
    file: path.join("delivery-varanda-ype-campinas", "index.html"),
    title: "Delivery Varanda Ypê em Campinas | 99Food, iFood e pedidos",
    description:
      "Encontre Varanda Ypê - Marmitas, Executivos & Grelhados no iFood e 99Food. Delivery em Campinas, Jardim Aurélia, cardápio e pedidos online.",
    canonical: "https://varandaype.com/delivery-varanda-ype-campinas/",
    preload: { href: "/pratos/chorizo.webp" },
    image: "https://varandaype.com/pratos/chorizo.webp",
  },
  {
    route: "/restaurante-jardim-aurelia", file: path.join("restaurante-jardim-aurelia", "index.html"),
    title: "Restaurante no Jardim Aurélia, Campinas | Varanda Ypê",
    description: "Restaurante no Jardim Aurélia, em Campinas, com comida brasileira, almoço, jantar, porções, espetinhos, espaço kids e delivery.",
    canonical: "https://varandaype.com/restaurante-jardim-aurelia/",
    preload: { href: "/pratos/chorizo.webp" },
  },
  {
    route: "/almoco-jardim-aurelia", file: path.join("almoco-jardim-aurelia", "index.html"),
    title: "Almoço no Jardim Aurélia, Campinas | Varanda Ypê",
    description: "Almoço no Jardim Aurélia com grelhados, massas, risotos, pratos para a família, marmitaria e atendimento para empresas.",
    canonical: "https://varandaype.com/almoco-jardim-aurelia/",
    preload: { href: "/pratos/fraldinha.webp" },
    image: "https://varandaype.com/pratos/fraldinha.webp",
  },
  {
    route: "/restaurante-com-espaco-kids-campinas", file: path.join("restaurante-com-espaco-kids-campinas", "index.html"),
    title: "Restaurante com espaço kids reformado em Campinas | Varanda Ypê",
    description: "Restaurante com espaço kids no Jardim Aurélia, em Campinas. Brinquedão reformado em 2026, comida brasileira, pratos kids, almoço, jantar e ambiente familiar.",
    canonical: "https://varandaype.com/restaurante-com-espaco-kids-campinas/",
    preload: { href: "/ambiente/espaco-kids-restaurante-varanda-ype-campinas.webp" },
    image: "https://varandaype.com/ambiente/espaco-kids-restaurante-varanda-ype-campinas.webp",
  },
  {
    route: "/porcoes-chopp-jardim-aurelia", file: path.join("porcoes-chopp-jardim-aurelia", "index.html"),
    title: "Porções e chopp no Jardim Aurélia | Varanda Ypê",
    description: "Porções, espetinhos, chopp e bebidas no Jardim Aurélia, em Campinas. Consulte o cardápio e venha jantar no Varanda Ypê.",
    canonical: "https://varandaype.com/porcoes-chopp-jardim-aurelia/",
    preload: { href: "/porcoes/calabresa-com-fritas.webp" },
    image: "https://varandaype.com/porcoes/calabresa-com-fritas.webp",
  },
  {
    route: "/privacidade",
    file: path.join("privacidade", "index.html"),
    title: "Política de Privacidade | Varanda Ypê",
    description:
      "Como o Varanda Ypê trata os dados de quem visita o site e fala com a casa: navegação, formulários, ferramentas de terceiros, cookies e direitos previstos na LGPD.",
    canonical: "https://varandaype.com/privacidade/",
  },
];

const SITE = "https://varandaype.com";

function absImage(src) {
  if (!src) return null;
  return src.startsWith("http") ? src : `${SITE}${src}`;
}

function pageForProduct(product) {
  const webp = product.image
    ? product.image.replace(/\.(png|jpe?g)$/i, ".webp")
    : null;
  return {
    route: `/${product.slug}`,
    file: path.join(product.slug, "index.html"),
    title: product.metaTitle || `${product.eyebrow} em Campinas | Varanda Ypê`,
    description: product.metaDescription || product.intro,
    canonical: `https://varandaype.com/${product.slug}/`,
    image: absImage(product.image),
    preload: webp ? { href: webp } : null,
  };
}

// LCP hint for the one eager hero image on the page. Injected into <head> so
// the browser can start the fetch during HTML parse instead of after render.
function preloadTag(preload) {
  if (!preload) return "";
  const attrs = preload.srcset
    ? `imagesrcset="${preload.srcset}" imagesizes="${preload.sizes}"`
    : `href="${preload.href}"`;
  return `<link rel="preload" as="image" type="image/webp" ${attrs} fetchpriority="high" />`;
}

function applyHead(html, page) {
  let out = html
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

  if (page.image) {
    out = out
      .replace(
        /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/s,
        `<meta property="og:image" content="${page.image}" />`,
      )
      .replace(
        /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/s,
        `<meta name="twitter:image" content="${page.image}" />`,
      );
  }

  if (page.preload) {
    out = out.replace("</head>", `  ${preloadTag(page.preload)}\n  </head>`);
  }

  return out;
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
