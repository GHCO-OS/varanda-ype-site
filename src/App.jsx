import React, { useEffect, useState } from "react";
import { EmberField } from "./EmberField.jsx";
import { PlateHalo } from "./PlateHalo.jsx";
import { Reveal } from "./Reveal.jsx";

// Serves WebP with a PNG fallback via <picture>, ships explicit width/height so
// the browser reserves space before the image loads (no layout shift), and
// lazy-loads everything below the fold. Pass `priority` for the one hero image
// that should load eagerly (the page's LCP candidate).
function Img({ src, alt, width, height, className, priority = false, smSrc }) {
  const webp = src.replace(/\.png$/, ".webp");
  const webpSm = smSrc ? smSrc.replace(/\.png$/, ".webp") : null;

  return (
    <picture>
      {webpSm ? (
        <source
          type="image/webp"
          srcSet={`${webpSm} 420w, ${webp} 600w`}
          sizes="(max-width: 640px) 420px, 600px"
        />
      ) : (
        <source type="image/webp" srcSet={webp} />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        {...(priority ? { fetchPriority: "high" } : {})}
      />
    </picture>
  );
}

// Fixed, site-wide call-to-action. Renders once at the App root so it's on
// every route, including a subtle entrance so it doesn't just "pop" over content.
function FloatingWhatsapp() {
  return (
    <a
      className="floating-whatsapp"
      href={whatsappFloatingUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.22.6 4.33 1.73 6.2L4 29l7.94-1.7a12.9 12.9 0 0 0 4.08.66C22.6 27.96 28 22.56 28 15.94 28 9.32 22.64 3 16.02 3Zm7.36 17.5c-.32.9-1.6 1.66-2.6 1.88-.7.14-1.62.26-4.7-1.02-3.95-1.66-6.5-5.6-6.7-5.87-.2-.27-1.6-2.13-1.6-4.06 0-1.94.98-2.88 1.34-3.28.36-.4.78-.5 1.05-.5.26 0 .53 0 .76.02.24.02.57-.1.9.68.32.78 1.1 2.7 1.2 2.9.1.2.16.44.03.7-.13.28-.2.44-.4.68-.2.24-.42.53-.6.72-.2.2-.4.42-.18.82.24.4 1.06 1.74 2.27 2.83 1.56 1.4 2.87 1.83 3.27 2.03.4.2.63.16.87-.1.24-.26 1-1.16 1.27-1.56.27-.4.53-.33.9-.2.36.14 2.3 1.08 2.7 1.28.4.2.66.3.76.46.1.18.1 1.02-.22 1.93Z"
        />
      </svg>
    </a>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="16" height="16" aria-hidden="true" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.4 0 6.4 1.17 8.8 3.46l6.55-6.55C35.3 2.6 30 0.5 24 0.5 14.6 0.5 6.5 5.9 2.6 13.7l7.62 5.92C12.1 13.5 17.6 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.64-.15-3.2-.42-4.7H24v9h12.6c-.55 2.9-2.2 5.35-4.68 7l7.4 5.75C43.6 37.4 46.5 31.5 46.5 24.5Z"
      />
      <path
        fill="#FBBC05"
        d="M10.22 27.9a14.4 14.4 0 0 1 0-7.8l-7.62-5.9a24 24 0 0 0 0 19.6l7.62-5.9Z"
      />
      <path
        fill="#34A853"
        d="M24 47.5c6 0 11.3-2 15.02-5.35l-7.4-5.75c-2.06 1.4-4.7 2.2-7.62 2.2-6.4 0-11.9-4-13.78-9.6l-7.62 5.9C6.5 42.1 14.6 47.5 24 47.5Z"
      />
    </svg>
  );
}

const ifoodUrl =
  "https://www.ifood.com.br/delivery/campinas-sp/varanda-ype---grill--executivos-jardim-aurelia/2ba9a14c-3df9-4725-8b6b-1294c2c1b156";
const whatsappUrl = "https://wa.me/551931991971";
const companyWhatsappUrl =
  "https://wa.me/551931991971?text=Ol%C3%A1%2C%20quero%20falar%20sobre%20pedido%20para%20empresa%20no%20Varanda%20Yp%C3%AA.";
const whatsappFloatingUrl = "https://wa.me/qr/W6EPSB7NP3KBF1";
const googleBusinessUrl = "https://share.google/pxyfGTy3KNNdToPxk";
const companyFormUrl = "https://form.jotform.com/262195555788070";

const menuHighlights = [
  {
    title: "Chorizo executivo",
    text: "Chorizo grelhado com arroz, feijão, farofa e mandioca frita.",
    image: "/pratos/chorizo.png",
  },
  {
    title: "Fraldinha",
    text: "Fraldinha grelhada com arroz, feijão, farofa e mandioca.",
    image: "/pratos/fraldinha.png",
  },
  {
    title: "Risoto cuiabano",
    text: "Prato cremoso, bem servido e com sabor brasileiro.",
    image: "/pratos/risoto-cuiabano.png",
  },
  {
    title: "Talharim",
    text: "Massa cremosa acompanhada de carne grelhada.",
    image: "/pratos/talharim.png",
  },
];

const experienceItems = [
  ["Pratos e espetinhos", "Comida brasileira para almoço, jantar e mesa cheia."],
  ["Chopp e porções", "Clima de boteco brasileiro com petiscos para compartilhar."],
  ["Espaço kids", "Ambiente para a família. Em breve, recreação para família."],
];

const portionGallery = [
  ["Calabresa com fritas", "/porcoes/calabresa-com-fritas.png"],
  ["Fritas 500g", "/porcoes/fritas-500g.png"],
  ["Isca de cordão de mignon", "/porcoes/isca-cordao-mignon.png"],
  ["Isca de frango à milanesa", "/porcoes/isca-frango-milanesa.png"],
  ["Tulipa frita", "/porcoes/tulipa-frita.png"],
];

const companyServices = [
  {
    title: "Almoço para equipes",
    text: "Pratos executivos e opções bem servidas para equipes, plantões, treinamentos e dias de reunião.",
  },
  {
    title: "Pedidos recorrentes",
    text: "Atendimento para empresas que precisam organizar refeições com frequência e previsibilidade.",
  },
  {
    title: "Reuniões e confraternizações",
    text: "Porções, grelhados, espetinhos e bebidas para encontros de trabalho em clima mais leve.",
  },
];

const companySteps = [
  ["Data e horário", "Informe quando a refeição precisa estar pronta ou ser entregue."],
  ["Volume aproximado", "Passe a quantidade de pessoas ou refeições para montarmos a melhor sugestão."],
  ["Perfil do pedido", "Almoço executivo, porções, espetinhos, bebidas ou uma combinação para o grupo."],
  ["Confirmação", "Alinhamos cardápio, prazo, retirada ou entrega e fechamos tudo pelo WhatsApp."],
];

const fullMenuSections = [
  {
    id: "la-carte",
    emoji: "🍽️",
    title: "À la carte",
    note: "Pratos individuais e porções bem servidas.",
    items: [
      {
        name: "Bife Ancho",
        price: "R$ 52 / R$ 99",
        meta: "Serve 1: 180g | Serve 2: 390g",
        desc: "Filé argentino macio, grelhado no azeite e servido com fritas.",
      },
      {
        name: "Filé Mignon",
        price: "R$ 65",
        meta: "Serve 1: 180g",
        desc: "Grelhado no azeite, com brócolis e molho à escolha: madeira ou branco.",
      },
      {
        name: "Picanha Carreteira",
        price: "R$ 76 / R$ 149",
        meta: "Serve 1: 185g | Serve 2: 400g",
        desc: "Corte nobre com arroz carreteiro e queijo coalho dourado.",
      },
      {
        name: "Fraldinha Assada",
        price: "R$ 48",
        meta: "Serve 1: 200g",
        desc: "Assada lentamente com chimichurri e acompanhada de mandioca frita.",
      },
      {
        name: "Costela Cuiabar",
        price: "R$ 41",
        meta: "Serve 1: 200g",
        desc: "Sem osso, assada no bafo e servida com mandioca frita.",
      },
      {
        name: "Tilápia Fresca",
        price: "R$ 45",
        meta: "Serve 1: 200g",
        desc: "Filé grelhado no fio do azeite com legumes salteados.",
      },
      {
        name: "Lombo de Salmão",
        price: "R$ 71",
        meta: "Serve 1: 200g",
        desc: "Grelhado no azeite com alho e cebola, arroz à grega e legumes.",
      },
      {
        name: "Filé à Vilalva",
        price: "R$ 39,90",
        meta: "Serve 1: 190g",
        desc: "Frango empanado e gratinado com presunto, queijo, palmito, ervilha e requeijão. Acompanha fritas.",
      },
    ],
  },
  {
    id: "massas-risotos",
    emoji: "🍝",
    title: "Risotos e massas",
    note: "Cremosos, intensos e com o toque da casa.",
    items: [
      {
        name: "Risoto Milanês",
        price: "R$ 53",
        desc: "Açafrão-da-terra com salmão grelhado e alcaparras.",
      },
      {
        name: "Risoto Funghi",
        price: "R$ 48,90",
        desc: "Cogumelos defumados, mignon em tiras e toque de molho madeira.",
      },
      {
        name: "Risoto Cuiabano",
        price: "R$ 45",
        desc: "Linguiça artesanal da casa e mix de pimentas. Picante na medida.",
      },
      {
        name: "Talharim 4Q",
        price: "R$ 49",
        desc: "Molho cremoso de mussarela, gorgonzola, parmesão e Catupiry, com mignon grelhado.",
      },
      {
        name: "Nhoque Ripiene",
        price: "R$ 47",
        desc: "Recheado com orégano e mussarela, ao molho branco, com iscas de mignon.",
      },
    ],
  },
  {
    id: "espetinhos",
    emoji: "🔥",
    title: "Espetinhos",
    note: "Somente à noite.",
    items: [
      {
        name: "Clássicos",
        price: "R$ 10/un",
        desc: "Coração de frango, cordão de mignon, mignon suíno, filé de frango, tulipa de frango, pancetinha, linguicinha, pão de alho, queijo coalho, kafta tradicional ou kafta com queijo.",
      },
      {
        name: "Especiais",
        price: "R$ 12/un",
        desc: "Medalhão de frango, medalhão de carne, provolone grelhado ou linguiça cuiabana.",
      },
      {
        name: "Premium",
        price: "R$ 15 / R$ 18",
        desc: "Cupim com queijo por R$ 15. Picanha Grill por R$ 18.",
      },
      {
        name: "Jantinha Expressa",
        price: "R$ 35,90",
        desc: "2 espetinhos clássicos.",
      },
    ],
  },
  {
    id: "parmegiana-familia",
    emoji: "🧀",
    title: "Parmegiana e família",
    note: "Para matar a fome sozinho ou dividir.",
    items: [
      {
        name: "Parchicken",
        price: "R$ 44,90 / R$ 82,90 / R$ 126",
        meta: "Serve 1: 190g | Serve 2: 380g | Serve 3: 580g",
        desc: "Parmegiana de frango com arroz e fritas.",
      },
      {
        name: "Parmignon",
        price: "R$ 59 / R$ 116 / R$ 168",
        meta: "Serve 1: 190g | Serve 2: 380g | Serve 3: 600g",
        desc: "Parmegiana de mignon com arroz e fritas.",
      },
      {
        name: "Picanha Família",
        price: "R$ 259,90",
        meta: "Serve até 4 | 650g",
        desc: "Picanha grelhada e fatiada com arroz carreteiro, feijão tropeiro, farofa, vinagrete e fritas.",
      },
      {
        name: "Costela Família",
        price: "R$ 185",
        meta: "Serve até 4 | 700g",
        desc: "Costela com arroz carreteiro, feijão tropeiro, farofa, vinagrete e mandioca frita.",
      },
    ],
  },
  {
    id: "kids-saladas",
    emoji: "🥗",
    title: "Kids, saladas e complementos",
    note: "Opções leves, infantis e extras para a mesa.",
    items: [
      {
        name: "Picanha Kids",
        price: "R$ 39,90",
        desc: "Grelhado e fatiado. Acompanha arroz, feijão e batata frita.",
      },
      {
        name: "Frango Kids",
        price: "R$ 29,90",
        desc: "Acompanha arroz, feijão e batata frita.",
      },
      {
        name: "Mignon Kids",
        price: "R$ 34,90",
        desc: "Acompanha arroz, feijão e batata frita.",
      },
      {
        name: "Saladas frescas",
        price: "R$ 22 a R$ 45",
        desc: "Clássica, simples, domingo ou mista. Tamanhos pequeno e grande.",
      },
      {
        name: "Complementos",
        price: "R$ 7,90 a R$ 29",
        desc: "Arroz, arroz com feijão executivo, arroz biro-biro, feijão clássico, arroz carreteiro, feijão Cuiabar e vinagrete.",
      },
    ],
  },
  {
    id: "porcoes",
    emoji: "🍟",
    title: "Pra beliscar e prosear",
    note: "Porções bem servidas para dividir com a mesa.",
    items: [
      { name: "Calabresa com fritas", price: "R$ 47,90", meta: "400g" },
      { name: "Contra acebolado", price: "R$ 57", meta: "400g" },
      { name: "Provolone à milanesa", price: "R$ 48,90", meta: "300g" },
      { name: "Torresmo pururuca", price: "R$ 29,90 / R$ 38", meta: "200g / 300g" },
      { name: "Fritas clássica", price: "R$ 27 / R$ 31,90", meta: "300g / 500g" },
      { name: "Fritas América", price: "R$ 35 / R$ 44", meta: "300g / 500g", desc: "Cheddar e bacon." },
      { name: "Anel de cebola", price: "R$ 29,90 / R$ 36", meta: "300g / 500g" },
      { name: "Mandioca frita", price: "R$ 26,90 / R$ 31,90", meta: "300g / 500g" },
      { name: "Sobrecoxa crocante", price: "R$ 45,90", meta: "500g", desc: "Empanada com panko." },
      { name: "Panceta do chefe", price: "R$ 46,90", meta: "500g", desc: "Barbecue e limão." },
      { name: "Isca de tilápia", price: "R$ 64,90", meta: "500g", desc: "Empanada." },
      { name: "Costela com mandioca", price: "R$ 63,90", meta: "500g", desc: "Mandioca frita e pão de alho." },
      { name: "Isca de mignon", price: "R$ 72,90", meta: "450g", desc: "Catupiry à parte." },
      { name: "Linguiça Cuiabana", price: "R$ 65,90", meta: "500g", desc: "Com fritas ou mandioca frita." },
    ],
  },
  {
    id: "fritinhos-pasteis",
    emoji: "🥟",
    title: "Fritinhos, pastéis e lanches",
    note: "Para pedir rápido com bebida gelada.",
    items: [
      { name: "Bolinho de mandioca", price: "R$ 23,90 / R$ 38,90", meta: "3un / 6un", desc: "Carne louca e queijo." },
      { name: "Bolinho Cuiabar", price: "R$ 27,90 / R$ 45,90", meta: "3un / 6un", desc: "Cabotiá e carne seca." },
      { name: "Croquete especial", price: "R$ 29 / R$ 37,90", meta: "4un / 8un", desc: "Carne e bacon." },
      { name: "Coxinha tradicional", price: "R$ 20 / R$ 30,90", meta: "4un / 8un", desc: "Frango desfiado." },
      { name: "Bolinho de jiló", price: "R$ 23 / R$ 33,90", meta: "3un / 6un", desc: "Cream cheese e provolone." },
      { name: "Pastéis mini", price: "R$ 26 a R$ 32", meta: "6un", desc: "Carne com queijo, carne ou queijo." },
      { name: "Pastel grande de feira", price: "R$ 15 a R$ 22", desc: "Queijo, pernil/queijo, presunto/queijo, frango Catupiry, carne queijo ou costela queijo." },
      { name: "Iscas supremas", price: "R$ 79,90 a R$ 95,90", desc: "Onion rings, fritas, Catupiry e pão de alho. Mignon, contra ou Cuiabar supremo." },
      { name: "Lanches", price: "R$ 29,90 a R$ 52", desc: "Contrafilé, costela, mignon, cuiabano, frango ou picanha." },
    ],
  },
  {
    id: "bebidas",
    emoji: "🍻",
    title: "Bebidas",
    note: "Cervejas, chopp, refrescos e drinks.",
    items: [
      {
        name: "Cervejas 600ml",
        price: "R$ 15 a R$ 24",
        desc: "Original, Spaten, Antarctica, Amstel, Heineken, Corona, Stella e Baden.",
      },
      {
        name: "Long neck",
        price: "R$ 11 a R$ 13",
        desc: "Heineken, Corona, Stella e Malzbier.",
      },
      {
        name: "Chopp",
        price: "R$ 10 a R$ 15",
        desc: "Itaipava, Amstel/Brahma e Heineken. Opções em copo.",
      },
      {
        name: "Refrescos",
        price: "R$ 7 a R$ 23",
        desc: "Refrigerante lata ou KS, suco copo ou jarra, soda italiana, energético e H2OH!",
      },
      {
        name: "Drinks",
        price: "R$ 22 a R$ 29",
        desc: "Caipifruta, caipiroska, saquerinha, piña colada, espanhola, mimosa e Aperol Spritz.",
      },
    ],
  },
];

function MenuItem({ item }) {
  return (
    <li className="online-menu-item">
      <div className="online-menu-line">
        <h3>{item.name}</h3>
        <strong>{item.price}</strong>
      </div>
      {item.meta && <p className="item-meta">{item.meta}</p>}
      {item.desc && <p>{item.desc}</p>}
    </li>
  );
}

function OnlineMenuContent() {
  return (
    <section className="online-menu section-cream" id="cardapio-completo">
      <div className="section-inner">
        <div className="online-menu-head">
          <div>
            <p className="section-label">Cardápio completo online</p>
            <h2>Leve para abrir, fácil de escolher</h2>
          </div>
          <p>
            Aqui tem comida de casa, grelhados, espetinhos, porções e bebidas
            para escolher com calma antes de chegar ou pedir.
          </p>
        </div>

        <Reveal as="aside" className="ifood-callout" aria-label="Pedido pelo iFood">
          <div>
            <span>🛵 iFood</span>
            <h3>Peça Varanda Ypê sem sair de casa</h3>
            <p>
              Acesse nosso delivery oficial no iFood para ver disponibilidade,
              promoções e formas de entrega.
            </p>
          </div>
          <a className="ifood-button" href={ifoodUrl} target="_blank" rel="noreferrer">
            Pedir no iFood
          </a>
        </Reveal>

        <div className="menu-shortcuts" aria-label="Atalhos do cardápio completo">
          {fullMenuSections.map((section) => (
            <a href={`#${section.id}`} key={section.id}>
              <span>{section.emoji}</span>
              {section.title}
            </a>
          ))}
        </div>

        <div className="online-menu-grid">
          {fullMenuSections.map((section, index) => (
            <Reveal
              as="article"
              className="online-menu-section"
              id={section.id}
              key={section.id}
              delay={Math.min(index, 4) * 70}
            >
              <header>
                <span className="section-emoji" aria-hidden="true">
                  {section.emoji}
                </span>
                <div>
                  <h3>{section.title}</h3>
                  <p>{section.note}</p>
                </div>
              </header>
              <ul>
                {section.items.map((item) => (
                  <MenuItem item={item} key={`${section.id}-${item.name}`} />
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MenuPage() {
  return (
    <main className="menu-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/" aria-label="Voltar para a home">
          Home
        </a>
        <a className="ifood-header-button" href={ifoodUrl} target="_blank" rel="noreferrer">
          iFood
        </a>
        <a className="header-cta" href="/empresa">
          Empresas
        </a>
      </header>
      <OnlineMenuContent />
    </main>
  );
}

export function CompanyPage() {
  return (
    <main className="company-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu">
          Cardápio
        </a>
        <a className="ifood-header-button" href={companyWhatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>

      <section className="company-hero">
        <EmberField className="embers-layer" density="low" />
        <div className="section-inner company-hero-grid">
          <div>
            <p className="section-label">Empresas e grupos</p>
            <h1>Refeições para equipes, reuniões e pedidos em volume</h1>
            <p>
              O Varanda Ypê atende empresas que precisam organizar almoço,
              jantar, pedidos recorrentes ou encontros de equipe com comida
              brasileira bem servida.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={companyWhatsappUrl} target="_blank" rel="noreferrer">
                Falar sobre pedido
              </a>
              <a className="button button-secondary" href={companyFormUrl} target="_blank" rel="noreferrer">
                Pedir cotação
              </a>
              <a className="button button-secondary" href="/menu">
                Ver cardápio
              </a>
            </div>
          </div>
          <div className="company-plate">
            <PlateHalo className="plate-halo" />
            <Img
              src="/pratos/fraldinha.png"
              smSrc="/pratos/fraldinha-sm.png"
              alt="Fraldinha servida no Varanda Ypê"
              width={420}
              height={420}
              priority
            />
            <strong>Pedidos sob consulta</strong>
          </div>
        </div>
      </section>

      <section className="company-services section-cream">
        <Reveal className="section-inner">
          <div className="section-heading">
            <p className="section-label">Como podemos atender</p>
            <h2>Comida de casa para o dia de trabalho</h2>
          </div>
          <div className="company-card-grid">
            {companyServices.map((service) => (
              <article className="company-card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="company-details section-green">
        <Reveal className="section-inner company-detail-grid">
          <div>
            <p className="section-label">Prazo, volume e logística</p>
            <h2>Alinhamos o pedido com antecedência para servir melhor</h2>
          </div>
          <div className="company-detail-list">
            {companySteps.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="company-cta section-cream">
        <Reveal className="section-inner company-cta-box">
          <div>
            <p className="section-label">Atendimento direto</p>
            <h2>Conte o que sua empresa precisa</h2>
            <p>
              Fale direto pelo WhatsApp ou preencha o formulário com data,
              horário, quantidade de pessoas e tipo de refeição. A equipe
              responde com as melhores opções para o pedido.
            </p>
          </div>
          <div className="company-cta-actions">
            <a className="ifood-button" href={companyWhatsappUrl} target="_blank" rel="noreferrer">
              Chamar no WhatsApp
            </a>
            <a className="button button-secondary-onlight" href={companyFormUrl} target="_blank" rel="noreferrer">
              Preencher formulário
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <main>
      <section className="hero" id="inicio">
        <EmberField className="embers-layer" />
        <header className="site-header" aria-label="Navegação principal">
          <a className="brand" href="/" aria-label="Início do Varanda Ypê">
            <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
            <span>Varanda Ypê</span>
          </a>
          <nav id="primary-nav" className={menuOpen ? "nav-open" : ""} onClick={() => setMenuOpen(false)}>
            <a href="/menu">Cardápio</a>
            <a href="/empresa">Empresas</a>
            <a href={ifoodUrl} target="_blank" rel="noreferrer">
              Delivery
            </a>
            <a href="#ambiente">Ambiente</a>
            <a href="#porcoes">Porções</a>
            <a href="#horarios">Horários</a>
            <a className="nav-google" href={googleBusinessUrl} target="_blank" rel="noreferrer">
              <GoogleIcon /> Avaliações
            </a>
            <a href="#contato">Contato</a>
          </nav>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <a className="header-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="signature">Comida brasileira • Boteco • Família</p>
            <h1>Sabor de varanda, mesa cheia e bom boteco brasileiro</h1>
            <p className="hero-text">
              Uma casa para vir com a família, almoçar sem pressa, jantar com
              amigos, tomar um chopp gelado e dividir porções caprichadas.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="/menu">
                Ver cardápio
              </a>
              <a className="button button-secondary" href={ifoodUrl} target="_blank" rel="noreferrer">
                Pedir no iFood
              </a>
              <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer">
                Reservar mesa
              </a>
            </div>
          </div>

          <div className="hero-media" aria-label="Mesa brasileira servida">
            <div className="hero-photo">
              <PlateHalo className="plate-halo hero-plate-halo" />
              <Img
                src="/pratos/chorizo.png"
                smSrc="/pratos/chorizo-sm.png"
                alt="Chorizo executivo servido no Varanda Ypê"
                width={560}
                height={560}
                priority
              />
            </div>
            <div className="seal-card">
              <Img src="/logo-varanda-icon.png" alt="Símbolo do Varanda Ypê" width={260} height={260} priority />
            </div>
          </div>
        </div>
      </section>

      <section className="about section-cream" id="ambiente">
        <Reveal className="section-inner about-grid">
          <div>
            <p className="section-label">Casa brasileira</p>
            <h2>Uma casa brasileira para almoçar, brindar e ficar</h2>
          </div>
          <p>
            O Varanda Ypê é aquele lugar para comer bem, reunir a família e ficar
            à vontade. Tem pratos bem servidos, espetinhos, chopp, porções e espaço
            kids para a mesa toda aproveitar.
          </p>
        </Reveal>
      </section>

      <section className="menu section-green" id="cardapio">
        <div className="section-inner">
          <Reveal as="div" className="section-heading">
            <p className="section-label">Cardápio</p>
            <h2>Destaques para pedir sem pensar muito</h2>
          </Reveal>
          <div className="menu-list">
            {menuHighlights.map((item, index) => (
              <Reveal as="article" className="dish" key={item.title} delay={Math.min(index, 3) * 80}>
                <Img
                  className="dish-photo"
                  src={item.image}
                  smSrc={item.image.replace(/\.png$/, "-sm.png")}
                  alt={item.title}
                  width={420}
                  height={290}
                />
                <div className="dish-copy">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="gallery section-cream" id="porcoes">
        <div className="section-inner">
          <Reveal as="div" className="section-heading">
            <p className="section-label">Porções de boteco</p>
            <h2>Destaques para dividir com chopp gelado</h2>
          </Reveal>
          <div className="gallery-grid">
            {portionGallery.map(([title, image], index) => (
              <Reveal as="article" className="gallery-card" key={title} delay={Math.min(index, 4) * 60}>
                <Img src={image} alt={title} width={300} height={300} />
                <h3>{title}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="experience section-cream" id="horarios">
        <Reveal className="section-inner experience-grid">
          <div className="round-photo" aria-hidden="true">
            <span>Varanda Ypê</span>
          </div>
          <div>
            <p className="section-label">Almoço, jantar e família</p>
            <h2>Pratos, espetinhos, chopp, porções e espaço kids</h2>
            <div className="experience-list">
              {experienceItems.map(([title, text]) => (
                <article key={title}>
                  <span />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="footer" id="contato">
        <div className="section-inner footer-grid">
          <div>
            <Img src="/logo-icon-96.png" alt="" width={74} height={74} />
            <h2>Varanda Ypê</h2>
            <p>Comida brasileira • Boteco • Família</p>
          </div>
          <div>
            <h3>Contato</h3>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Reservas pelo WhatsApp
            </a>
            <a href="https://instagram.com/varandaype" target="_blank" rel="noreferrer">
              @varandaype
            </a>
            <a href={googleBusinessUrl} target="_blank" rel="noreferrer">
              Ver no Google
            </a>
            <p>Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia</p>
          </div>
          <div>
            <h3>Horários</h3>
            <p>Almoço: sexta, 11h às 14h30; sábado, 11h às 15h; domingo, 11h às 16h.</p>
            <p>Jantar: segunda a sábado, 18h às 23h.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function App({ initialPath } = {}) {
  const currentPath =
    initialPath || (typeof window === "undefined" ? "/" : window.location.pathname);
  const route = currentPath.replace(/\/$/, "");

  if (route === "/ifood") {
    window.location.replace(ifoodUrl);
    return null;
  }

  let page;
  if (route === "/menu") {
    page = <MenuPage />;
  } else if (route === "/empresa") {
    page = <CompanyPage />;
  } else {
    page = <HomePage />;
  }

  return (
    <>
      {page}
      <FloatingWhatsapp />
    </>
  );
}

export default App;
