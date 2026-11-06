import React, { useEffect, useMemo, useState } from "react";
import { Reveal } from "./Reveal.jsx";
import { AmbienceGallery } from "./AmbienceGallery.jsx";
import { MarmitariaPage } from "./Marmitaria.jsx";
const DeliveryRouter = React.lazy(() => import('./delivery/DeliveryRouter.jsx'));
const MarketingRouter = React.lazy(() => import('./marketing/MarketingRouter.jsx'));
import { destinations } from '../shared/delivery.js';
import { hasConsentChoice, saveConsent } from './marketing/consent.js';
import { fullMenuSections, menuItemImages } from '../shared/menu-data.js';
import { rotisseriaAcompanhamentos, rotisseriaAssados, rotisseriaFaqs, rotisseriaImage, rotisseriaShareImage, rotisseriaWhatsappUrl } from '../shared/rotisseria-data.js';
import { buildSearchableSections, searchMenu } from '../shared/search.js';

// Serves WebP with an image fallback via <picture>, ships explicit width/height so
// the browser reserves space before the image loads (no layout shift), and
// lazy-loads everything below the fold. Pass `priority` for the one hero image
// that should load eagerly (the page's LCP candidate).
function Img({ src, alt, width, height, className, priority = false, smSrc }) {
  const webp = src.replace(/\.(png|jpe?g)$/i, ".webp");
  const webpSm = smSrc ? smSrc.replace(/\.(png|jpe?g)$/i, ".webp") : null;

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

function PaymentMethods() {
  return <section className="payments-section" aria-labelledby="payments-title">
    <div className="section-inner">
      <p className="section-label">Pagamento</p>
      <h2 id="payments-title">Pague do jeito que for melhor para você</h2>
      <p className="payments-intro">Na loja, aceitamos cartões de débito e crédito, Pix, Google Pay e Apple Pay quando disponíveis no terminal.</p>
      <div className="payments-grid">
        <div><h3>Cartões e Pix</h3><p>Débito, crédito e Pix.</p></div>
        <div><h3>Vale-alimentação e refeição</h3><p>Pluxee (Sodexo), Ticket, VR, Verocard, Alelo, Ben Visa Vale, Caju, Flash, Swile e outros, conforme credenciamento e disponibilidade.</p></div>
        <div><h3>Pedidos por aplicativo</h3><p>iFood e 99Food têm políticas próprias de voucher. Confira no aplicativo se o seu benefício é aceito; o pagamento é processado pela plataforma, não pela loja.</p></div>
      </div>
    </div>
  </section>;
}

// Fixed, site-wide call-to-action. Renders once at the App root so it's on
// every route, including a subtle entrance so it doesn't just "pop" over content.
function FloatingWhatsapp({ route }) {
  const operation = typeof window === "undefined" ? "home" : (window.location.pathname.split("/").filter(Boolean)[0] || "home");
  return (
    <a
      className="floating-whatsapp"
      href={route === "/rotisseria" ? rotisseriaWhatsappUrl : whatsappFloatingUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Falar no WhatsApp"
      onClick={() => trackEvent("whatsapp_click", { operation, partner: "whatsapp", destination_id: "whatsapp_float", cta_position: "floating", location: "floating_button" })}
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

// Consent Mode: the index.html inline script denies optional storage by default.
// Bare accept/reject — no explanatory copy or granular picker. The full
// Política de Cookies (/cookies/) and Privacidade (/privacidade/) pages carry
// the explanation; this banner just needs to not be in the way.
function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasConsentChoice(window)) setVisible(true);
  }, []);

  if (!visible) return null;

  function decide(value) {
    const saved = saveConsent(value, window);
    trackEvent(saved.analytics || saved.advertising ? "consent_accept" : "consent_reject", {
      consent_analytics: saved.analytics,
      consent_advertising: saved.advertising,
      consent_personalization: saved.personalization,
    });
    window.dispatchEvent(new CustomEvent('vy:consent-changed', { detail: saved }));
    setVisible(false);
  }

  return (
    <div className="cookie-consent" role="dialog" aria-live="polite" aria-label="Cookies">
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-reject" onClick={() => decide({ analytics: false, advertising: false, personalization: false })}>
          Rejeitar
        </button>
        <button type="button" className="cookie-accept" onClick={() => decide({ analytics: true, advertising: true, personalization: true })}>
          Aceitar
        </button>
      </div>
    </div>
  );
}

function trackEvent(eventName, payload = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    site: "varanda_ype",
    ...payload,
  });
}

function MarketingTracker({ route }) {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    trackEvent("page_view", {
      path: route || "/",
      title: typeof document === "undefined" ? "Varanda Ypê" : document.title,
    });
  }, [route]);

  return null;
}

const ifoodUrl = destinations.ifood_restaurante.url;
const ninetyNineFoodPrimaryUrl = destinations.food99_restaurante.url;
const ninetyNineFoodMarmitariaUrl = destinations.food99_marmitas.url;
const expressoUrl = destinations.expresso_varanda.url;
const alloyUrl = expressoUrl;
const whatsappUrl = "https://wa.me/551931991971";
const companyWhatsappUrl =
  "https://wa.me/551931991971?text=Ol%C3%A1%2C%20quero%20falar%20sobre%20pedido%20para%20empresa%20no%20Varanda%20Yp%C3%AA.";
const whatsappFloatingUrl =
  "https://wa.me/551931991971?text=Ol%C3%A1%21%20Vim%20pelo%20site%20e%20gostaria%20de%20conhecer%20o%20card%C3%A1pio%20ou%20fazer%20um%20pedido.";
const googleBusinessUrl = "https://share.google/pxyfGTy3KNNdToPxk";
const companyFormUrl = "https://form.jotform.com/262195555788070";
const careersFormUrl = "https://tally.so/embed/A7E8Ql?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1";

export const productPages = [
  {
    slug: "pratos-executivos-campinas",
    eyebrow: "Pratos executivos",
    title: "Pratos executivos no Jardim Aurélia",
    intro:
      "Almoço bem servido em Campinas com pratos executivos, grelhados, massas, risotos e acompanhamentos brasileiros no Varanda Ypê.",
    image: "/pratos/chorizo.png",
    imageAlt: "Prato executivo servido no Varanda Ypê em Campinas",
    menuAnchor: "/menu/#la-carte",
    orderLabel: "Ver executivos",
    metaTitle: "Pratos executivos em Campinas | Varanda Ypê",
    metaDescription:
      "Pratos executivos no Jardim Aurélia, em Campinas: grelhados, carnes, frango, peixe, massas, risotos e almoço bem servido no Varanda Ypê.",
    sections: [
      [
        "Almoço direto e completo",
        "Os executivos do Varanda Ypê foram pensados para quem quer comer bem sem complicar: prato montado, acompanhamentos brasileiros e opções para diferentes fomes.",
      ],
      [
        "Grelhados, massas e risotos",
        "O cardápio reúne carnes grelhadas, frango, peixe, risotos e massas, com pratos como bife ancho, filé mignon, fraldinha, tilápia, salmão, risoto cuiabano e talharim 4 queijos.",
      ],
      [
        "Para salão, retirada ou delivery",
        "Consulte o cardápio online para ver preços e disponibilidade. Alguns itens podem variar conforme o horário de atendimento e o canal de pedido.",
      ],
    ],
    faqs: [
      ["Onde encontrar pratos executivos no Jardim Aurélia?", "No Varanda Ypê, na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas."],
      ["Quais tipos de executivos aparecem no cardápio?", "Há opções com carnes, frango, peixe, massas, risotos e acompanhamentos brasileiros."],
      ["Dá para pedir executivo por delivery?", "Sim. Consulte os canais de pedido online para ver disponibilidade no horário."],
    ],
  },
  {
    slug: "jantinha-campinas",
    eyebrow: "Jantinha",
    title: "Jantinha com 2 espetos por R$ 35,90 em Campinas",
    intro:
      "A Jantinha Expressa do Varanda Ypê vem com 2 espetos, arroz, feijão, farofa e vinagrete ou saladinha por R$ 35,90. Um jantar prático, completo e com clima de boteco no Jardim Aurélia.",
    image: "/pratos/jantinha-2-espetos-varanda-ype-campinas.jpg",
    imageAlt:
      "Jantinha Expressa do Varanda Ypê com 2 espetos, arroz, feijão, farofa e vinagrete ou saladinha por R$ 35,90 em Campinas",
    price: "R$ 35,90",
    priceValue: "35.90",
    keywords:
      "jantinha em Campinas, jantinha com espetinho, jantinha com 2 espetos, espetinho no Jardim Aurélia, jantar barato Campinas, arroz feijão farofa vinagrete",
    menuAnchor: "/menu/#espetinhos",
    orderLabel: "Ver jantinha",
    metaTitle: "Jantinha R$ 35,90 em Campinas | Varanda Ypê",
    metaDescription:
      "Jantinha em Campinas no Varanda Ypê por R$ 35,90: 2 espetos, arroz, feijão, farofa, vinagrete ou saladinha no Jardim Aurélia.",
    sections: [
      [
        "Jantinha completa e sem complicar",
        "Por R$ 35,90, a Jantinha Expressa reúne 2 espetos e acompanhamentos brasileiros de verdade: arroz, feijão, farofa e vinagrete ou saladinha. É para chegar, pedir e jantar bem.",
      ],
      [
        "Espetinho no Jardim Aurélia",
        "A opção combina o sabor do espetinho com prato feito de boteco, ideal para quem procura jantar em Campinas com comida simples, saborosa e bem servida.",
      ],
      [
        "Para comer no salão ou pedir",
        "Consulte o cardápio online para ver disponibilidade no horário. A casa também tem porções, chopp, bebidas e outros espetinhos para completar a mesa.",
      ],
    ],
    faqs: [
      ["Quando tem jantinha no Varanda Ypê?", "A jantinha e os espetinhos são opções do período noturno. O jantar presencial funciona de segunda a sábado, das 18h às 23h."],
      ["O que vem na Jantinha Expressa?", "A Jantinha Expressa vem com 2 espetos, arroz, feijão, farofa e vinagrete ou saladinha."],
      ["Quanto custa a Jantinha Expressa?", "A Jantinha Expressa custa R$ 35,90."],
      ["Onde fica o Varanda Ypê?", "Na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas."],
    ],
  },
  {
    slug: "grelhados-campinas",
    eyebrow: "Grelhados",
    title: "Grelhados no Jardim Aurélia, em Campinas",
    intro:
      "Carnes, frango e peixe grelhados com acompanhamentos brasileiros, em pratos executivos para almoço, salão e delivery no Varanda Ypê.",
    image: "/pratos/chorizo.png",
    imageAlt: "Chorizo grelhado com acompanhamentos no Varanda Ypê em Campinas",
    keywords:
      "grelhados Campinas, carnes grelhadas Jardim Aurélia, prato executivo Campinas, chorizo grelhado, fraldinha grelhada, almoço Jardim Aurélia",
    menuAnchor: "/menu/#la-carte",
    orderLabel: "Ver grelhados",
    metaTitle: "Grelhados em Campinas, Jardim Aurélia | Varanda Ypê",
    metaDescription:
      "Grelhados no Jardim Aurélia, em Campinas: carnes, frango e peixe com acompanhamentos brasileiros em pratos executivos no Varanda Ypê.",
    sections: [
      [
        "Carnes, frango e peixe na grelha",
        "O cardápio reúne opções como chorizo, fraldinha, filé mignon, frango, tilápia e salmão, preparadas para combinar sabor, praticidade e uma refeição completa.",
      ],
      [
        "Grelhados com acompanhamentos brasileiros",
        "Os pratos combinam proteínas grelhadas com arroz, feijão, fritas, legumes, saladas e outros acompanhamentos, conforme a opção escolhida no cardápio.",
      ],
      [
        "No Jardim Aurélia ou por delivery",
        "Consulte preços e disponibilidade no cardápio online. Os itens podem ser pedidos nos canais de delivery ou aproveitados no restaurante em Campinas.",
      ],
    ],
    faqs: [
      ["Onde comer grelhados no Jardim Aurélia?", "O Varanda Ypê fica na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas."],
      ["Quais grelhados aparecem no cardápio?", "Há opções com carnes bovinas, frango e peixes, além de acompanhamentos brasileiros."],
      ["É possível pedir grelhados por delivery?", "Sim. Consulte os canais de pedido para verificar disponibilidade, valores e entrega no momento do pedido."],
    ],
  },
  {
    slug: "pratos-familia-campinas",
    eyebrow: "Pratos família",
    title: "Pratos família grandes, completos e saborosos",
    intro:
      "Costela Família e Picanha Família do Varanda Ypê chegam grandes, completos e feitos para reunir todo mundo à mesa: 700g ou mais de carne, acompanhamentos brasileiros e aquele almoço de família que já resolve a fome de todos.",
    image: "/pratos/prato-familia-costela-picanha-varanda-ype-campinas.jpg",
    imageAlt:
      "Prato família grande do Varanda Ypê com costela, carne, arroz, feijão tropeiro, farofa e acompanhamentos para compartilhar em Campinas",
    keywords:
      "pratos família em Campinas, prato grande para família, costela família, picanha família, restaurante familiar Jardim Aurélia, almoço em família Campinas, carne 700g para compartilhar",
    menuAnchor: "/menu/#parmegiana-familia",
    orderLabel: "Ver pratos família",
    metaTitle: "Pratos família grandes em Campinas | Varanda Ypê",
    metaDescription:
      "Pratos família em Campinas para compartilhar: Costela Família e Picanha Família com 700g ou mais de carne, acompanhamentos brasileiros e comida farta no Varanda Ypê.",
    sections: [
      [
        "Prato grande para a mesa inteira",
        "Quando a família chega com fome, o pedido precisa vir à altura. Os pratos família do Varanda Ypê são grandes, completos e muito bem servidos, com 700g ou mais de carne para dividir sem miséria.",
      ],
      [
        "Costela e picanha como protagonistas",
        "Hoje as opções principais são Costela Família e Picanha Família. A Costela Família vem com arroz carreteiro, feijão tropeiro, farofa, vinagrete e mandioca frita. A Picanha Família vem com arroz carreteiro, feijão tropeiro, farofa, vinagrete e fritas.",
      ],
      [
        "Tilápia e frango em desenvolvimento",
        "A casa está desenvolvendo novas versões família com tilápia e frango para ampliar as opções. A ideia é manter a mesma proposta: prato bonito, farto, completo e perfeito para pais, mães, avós, crianças e grupos comerem juntos.",
      ],
    ],
    faqs: [
      ["Quantas pessoas os pratos família servem?", "Os pratos família foram pensados para compartilhar e servir a mesa com fartura, com 700g ou mais de carne e acompanhamentos."],
      ["Quais pratos família existem no cardápio?", "As opções principais são Picanha Família e Costela Família. Tilápia e frango estão em desenvolvimento."],
      ["Esses pratos têm acompanhamentos?", "Sim. Eles acompanham arroz carreteiro, feijão tropeiro, farofa, vinagrete e fritas ou mandioca, conforme a opção escolhida."],
      ["É uma boa opção para almoço em família?", "Sim. É uma das melhores escolhas para quem quer um prato central, grande e completo para compartilhar no almoço ou encontro em família."],
    ],
  },
  {
    slug: "marmitas-jardim-aurelia",
    eyebrow: "Marmitas",
    title: "Marmitas no Jardim Aurélia",
    intro:
      "Marmitaria e rotisseria todos os dias no almoço, com comida brasileira para rotina, retirada, delivery e pedidos sob consulta.",
    image: "/pratos/risoto-cuiabano.png",
    imageAlt: "Prato de almoço do Varanda Ypê para marmitas no Jardim Aurélia",
    menuAnchor: "/menu/",
    orderLabel: "Ver cardápio",
    metaTitle: "Marmitas no Jardim Aurélia, Campinas | Varanda Ypê",
    metaDescription:
      "Marmitas no Jardim Aurélia: marmitaria e rotisseria do Varanda Ypê todos os dias no almoço, das 11h às 14h30, em Campinas.",
    sections: [
      [
        "Almoço para a rotina",
        "A marmitaria do Varanda Ypê atende todos os dias no horário de almoço, com opções para quem está no trabalho, em casa ou procurando uma refeição prática no Jardim Aurélia.",
      ],
      [
        "Rotisseria e pedidos do dia",
        "A disponibilidade de pratos pode variar conforme a operação. O ideal é consultar o canal de pedido ou falar com a equipe para confirmar as opções do dia.",
      ],
      [
        "Também para empresas",
        "Empresas e equipes podem conversar com o Varanda Ypê sobre volume, datas, retirada ou entrega de refeições no almoço.",
      ],
    ],
    faqs: [
      ["Qual é o horário das marmitas?", "A marmitaria e rotisseria atende todos os dias, das 11h às 14h30."],
      ["Tem marmita no Jardim Aurélia?", "Sim. O Varanda Ypê fica no Jardim Aurélia, em Campinas."],
      ["Empresas podem pedir marmitas?", "Sim. Pedidos para equipes e volumes maiores podem ser combinados com antecedência."],
    ],
  },
  {
    slug: "carnes-por-kg-campinas",
    eyebrow: "Carnes por kg",
    title: "Carnes por kg em Campinas",
    intro:
      "Carnes assadas e grelhadas para encomendas, almoço de família, empresas e refeições em volume sob consulta no Varanda Ypê.",
    image: "/pratos/chorizo.png",
    imageAlt: "Carne grelhada do Varanda Ypê para pedidos por kg",
    menuAnchor: "/empresa/",
    orderLabel: "Consultar pedido",
    metaTitle: "Carnes por kg em Campinas | Varanda Ypê",
    metaDescription:
      "Carnes por kg em Campinas sob consulta no Varanda Ypê: opções para família, empresas, almoço, encomendas e eventos no Jardim Aurélia.",
    sections: [
      [
        "Pedidos sob consulta",
        "Para carnes por kg, o melhor caminho é falar com a equipe e informar data, quantidade de pessoas, tipo de carne e se o pedido será retirado ou entregue.",
      ],
      [
        "Para família e empresas",
        "A proposta atende ocasiões como almoço em família, reuniões, confraternizações e equipes que precisam organizar refeições com antecedência.",
      ],
      [
        "Cardápio brasileiro",
        "O Varanda Ypê trabalha com carnes, acompanhamentos brasileiros, porções e pratos bem servidos. A composição final depende do pedido e da disponibilidade.",
      ],
    ],
    faqs: [
      ["O Varanda Ypê vende carnes por kg?", "Pedidos de carnes por kg devem ser consultados diretamente com a equipe, conforme data, volume e disponibilidade."],
      ["Serve para empresas?", "Sim. A casa atende consultas para refeições corporativas e pedidos em volume."],
      ["Como faço orçamento?", "Fale pelo WhatsApp do Varanda Ypê e informe quantidade, data, horário e tipo de refeição."],
    ],
  },
  {
    slug: "chef-elisangela",
    eyebrow: "Chef Elisângela",
    title: "Chef Elisângela e a cozinha do Varanda Ypê",
    intro:
      "A assinatura da cozinha do Varanda Ypê passa por comida brasileira, pratos bem servidos e receitas pensadas para almoço, jantar e mesa de família.",
    image: "/logo-varanda-icon.png",
    imageAlt: "Marca do Varanda Ypê, restaurante de comida brasileira em Campinas",
    menuAnchor: "/menu/",
    orderLabel: "Conhecer cardápio",
    metaTitle: "Chef Elisângela | Varanda Ypê Campinas",
    metaDescription:
      "Conheça a cozinha do Varanda Ypê e a assinatura da Chef Elisângela em Campinas: comida brasileira, pratos executivos, família, boteco e marmitaria.",
    sections: [
      [
        "Cozinha brasileira de verdade",
        "A proposta da casa valoriza comida reconhecível, bem temperada e servida com cuidado: pratos executivos, carnes, risotos, massas, porções e opções para a família.",
      ],
      [
        "Do almoço ao jantar",
        "A cozinha conecta a rotina do almoço, a marmitaria, o jantar com espetinhos e as mesas maiores de fim de semana.",
      ],
      [
        "Mais conteúdo em breve",
        "Esta página será enriquecida com fotos, história, pratos autorais e programas especiais conforme novos materiais forem enviados.",
      ],
    ],
    faqs: [
      ["Quem é a Chef Elisângela?", "É a referência da cozinha do Varanda Ypê. A página será ampliada com história, fotos e pratos especiais enviados pela equipe."],
      ["Que tipo de comida o Varanda Ypê serve?", "Comida brasileira, pratos executivos, carnes, massas, risotos, porções, espetinhos e opções para família."],
      ["Onde vejo os pratos da casa?", "O cardápio completo está disponível na página de menu do Varanda Ypê."],
    ],
  },
];

const discoveryPages = [
  {
    slug: "delivery-varanda-ype-campinas",
    eyebrow: "Delivery e apps",
    title: "Encontre o Varanda Ypê nos apps e nas buscas",
    intro:
      "Procure por Varanda Ypê - Marmitas, Executivos & Grelhados no iFood e no 99Food. Em mapas e buscas locais, procure também por Varanda Ypê ou Varanda Ype em Campinas.",
    image: "/pratos/chorizo.png",
    imageAlt: "Prato executivo do Varanda Ypê disponível para pedido em Campinas",
    sections: [
      [
        "Nome igual em todos os lugares",
        "No iFood e no 99Food, o nome da loja é Varanda Ypê - Marmitas, Executivos & Grelhados. No Google e nos mapas, use também Varanda Ypê ou Varanda Ype junto de Jardim Aurélia ou Campinas.",
      ],
      [
        "Canais de pedido conhecidos",
        "O site aponta para iFood, 99Food e Expresso Varanda Ypê, além do WhatsApp oficial para tirar dúvidas, reservar mesa e confirmar disponibilidade.",
      ],
      [
        "Endereço para sugestão de local",
        "O endereço da casa é Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia, Campinas/SP. Manter esse dado igual nos apps ajuda os sistemas a reconhecerem o mesmo estabelecimento.",
      ],
    ],
    faqs: [
      ["Como procurar o Varanda Ypê nos apps?", "No iFood e no 99Food, busque por Varanda Ypê - Marmitas, Executivos & Grelhados. Em mapas, use Varanda Ypê, Jardim Aurélia ou o endereço Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Campinas."],
      ["Quais canais de pedido aparecem no site?", "O site direciona para iFood, 99Food, Expresso Varanda Ypê e WhatsApp oficial."],
      ["Por que o nome sem acento também aparece?", "Alguns apps e pesquisas tratam acentos de forma diferente. Usar Varanda Ypê e Varanda Ype ajuda a conectar buscas com e sem acento."],
    ],
  },
  {
    slug: "restaurante-jardim-aurelia",
    eyebrow: "Restaurante no Jardim Aurélia",
    title: "Comida brasileira no Jardim Aurélia, em Campinas",
    intro: "O Varanda Ypê reúne almoço, jantar, porções, espetinhos e bebidas na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, no Jardim Aurélia.",
    image: "/pratos/chorizo.png",
    imageAlt: "Prato executivo do restaurante Varanda Ypê no Jardim Aurélia",
    sections: [
      ["Uma casa para diferentes momentos", "Durante o almoço, a casa serve pratos bem acompanhados e opções para a rotina. À noite, espetinhos, porções e chopp deixam a mesa mais descontraída para famílias e grupos de amigos."],
      ["Onde fica o Varanda Ypê", "Estamos na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas. Para confirmar o funcionamento no dia da visita ou reservar uma mesa, fale com a equipe pelo WhatsApp."],
      ["Comer no salão ou pedir em casa", "Além do atendimento presencial, é possível consultar o cardápio e escolher entre os canais de delivery disponíveis. A disponibilidade de itens e entrega pode variar conforme o horário."],
    ],
    faqs: [
      ["Onde fica o Varanda Ypê?", "Na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas."],
      ["O restaurante serve almoço e jantar?", "Sim. Há atendimento presencial no almoço aos sábados e domingos e jantar de segunda a sábado. A marmitaria e rotisseria atende todos os dias no almoço."],
      ["Como consultar o cardápio?", "O cardápio completo está disponível no site, com pratos, porções, espetinhos e bebidas."],
    ],
  },
  {
    slug: "almoco-jardim-aurelia",
    eyebrow: "Almoço no Jardim Aurélia",
    title: "Pratos para o almoço no Jardim Aurélia",
    intro: "Executivos, grelhados, massas, risotos e opções para a família no almoço do Varanda Ypê, em Campinas.",
    image: "/pratos/fraldinha.png",
    imageAlt: "Fraldinha servida no almoço do Varanda Ypê em Campinas",
    sections: [
      ["Almoço bem servido", "O cardápio reúne carnes grelhadas, frango, peixe, massas, risotos e acompanhamentos brasileiros. Consulte os itens e preços atuais antes de vir ou pedir."],
      ["Presencial e marmitaria", "O almoço presencial acontece aos sábados e domingos, das 11h às 15h. A marmitaria e rotisseria funciona todos os dias, das 11h às 14h30, sujeita à disponibilidade do dia."],
      ["Almoço para equipes", "Empresas e grupos podem conversar com a equipe sobre quantidade, data, retirada ou entrega. Pedidos maiores devem ser combinados com antecedência."],
    ],
    faqs: [["Que horas é servido o almoço presencial?", "Aos sábados e domingos, das 11h às 15h."], ["Há almoço durante a semana?", "A marmitaria e rotisseria atende todos os dias, das 11h às 14h30. Confirme os itens disponíveis no dia."], ["O Varanda Ypê atende empresas?", "Sim. A casa recebe consultas para refeições de equipes, reuniões e pedidos em volume."]],
  },
  {
    slug: "restaurante-com-espaco-kids-campinas",
    eyebrow: "Família e espaço kids",
    title: "Restaurante com espaço kids reformado no Jardim Aurélia",
    intro:
      "No Varanda Ypê, pais, mães, avós e crianças encontram comida brasileira, conforto e um espaço kids reformado e revisado em 2026 para a família aproveitar com tranquilidade.",
    image: "/ambiente/espaco-kids-restaurante-varanda-ype-campinas.png",
    imageAlt:
      "Espaço kids com brinquedão colorido do restaurante familiar Varanda Ypê no Jardim Aurélia em Campinas",
    keywords:
      "restaurante com espaço kids em Campinas, restaurante com brinquedo no Jardim Aurélia, restaurante familiar, almoço com crianças, jantar em família, espaço para pais, mães, avós e crianças",
    sections: [
      [
        "Brinquedo para as crianças, mesa tranquila para os adultos",
        "O espaço kids do Varanda Ypê foi reformado e revisado em 2026 para oferecer mais conforto, comodidade e lazer. Enquanto as crianças brincam no brinquedão, a família aproveita almoço, jantar, porções e chopp com mais calma.",
      ],
      [
        "Restaurante para pais, mães e avós em Campinas",
        "A casa foi pensada para receber famílias de verdade: crianças com espaço para brincar, adultos à vontade na mesa e cardápio brasileiro para diferentes idades e fomes. É uma opção para almoço de fim de semana, jantar em família e encontros com avós, tios e amigos.",
      ],
      [
        "Cuidado, acolhimento e boas mãos",
        "Seus filhos ficam em um espaço preparado com atenção pela equipe do Varanda Ypê. O objetivo é que pais e responsáveis se sintam acolhidos, com as crianças por perto, se divertindo em um ambiente familiar e cuidado.",
      ],
    ],
    faqs: [
      [
        "O Varanda Ypê tem espaço kids com brinquedo?",
        "Sim. O restaurante tem espaço kids com brinquedão para crianças no Jardim Aurélia, em Campinas.",
      ],
      [
        "O espaço kids foi reformado?",
        "Sim. O espaço kids foi reformado e revisado em 2026 para conforto, comodidade e lazer das famílias e crianças.",
      ],
      [
        "É um restaurante indicado para famílias?",
        "Sim. O Varanda Ypê recebe pais, mães, avós e crianças com comida brasileira, pratos kids, porções, almoço de fim de semana e jantar em família.",
      ],
      [
        "É possível reservar mesa perto do espaço kids?",
        "A reserva pode ser solicitada pelo WhatsApp do restaurante. A equipe orienta a melhor disponibilidade para famílias com crianças.",
      ],
    ],
  },
  {
    slug: "porcoes-chopp-jardim-aurelia",
    eyebrow: "Boteco no Jardim Aurélia",
    title: "Porções, espetinhos e chopp no Jardim Aurélia",
    intro: "Para jantar, petiscar e dividir a mesa: porções de boteco, espetinhos e bebidas no Varanda Ypê.",
    image: "/porcoes/calabresa-com-fritas.png",
    imageAlt: "Porção de calabresa com fritas do Varanda Ypê",
    sections: [
      ["Porções para compartilhar", "O cardápio inclui fritas, mandioca, calabresa, torresmo, iscas, linguiça e outras opções para dividir. Preços e disponibilidade podem ser consultados no cardápio online."],
      ["Espetinhos no jantar", "À noite, a casa serve espetinhos clássicos e especiais, além de pratos, lanches e acompanhamentos. O jantar presencial funciona de segunda a sábado, das 18h às 23h."],
      ["Bebidas para acompanhar", "Chopp, cervejas, refrigerantes, sucos e drinks completam a experiência de boteco brasileiro no Jardim Aurélia."],
    ],
    faqs: [["Quando são servidos os espetinhos?", "Os espetinhos são servidos no período noturno."], ["Qual é o horário do jantar?", "De segunda a sábado, das 18h às 23h."], ["O cardápio de porções está online?", "Sim. O site apresenta as porções, tamanhos e preços para consulta."]],
  },
];

function WhatsAppChannelBanner() {
  return (
    <aside className="whatsapp-channel-banner" aria-label="Canal Família Varanda no WhatsApp">
      <span aria-hidden="true">🍽️</span>
      <p>Siga o canal <strong>“Família Varanda | Restaurante”</strong> no WhatsApp e receba promoções e informações.</p>
      <a href="https://whatsapp.com/channel/0029VbAcHLXFSAsxCt6lly0a" target="_blank" rel="noreferrer" onClick={() => trackEvent("channel_subscribe_click", { channel: "whatsapp", location: "top_banner" })}>Seguir canal</a>
    </aside>
  );
}

// Minimal, recognizable glyphs (currentColor, no external requests) so footer
// channels read at a glance instead of as a wall of plain-text links.
const footerSocialIconPaths = {
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347ZM12.004 2c-5.514 0-9.996 4.483-9.996 9.997 0 1.763.46 3.483 1.335 4.998L2 22l5.117-1.342a9.961 9.961 0 0 0 4.885 1.242h.004c5.514 0 9.996-4.483 9.996-9.997A9.935 9.935 0 0 0 19.08 4.92 9.933 9.933 0 0 0 12.005 2Zm5.84 15.831a8.26 8.26 0 0 1-5.84 2.418h-.003a8.272 8.272 0 0 1-4.223-1.159l-.303-.18-3.037.796.812-2.961-.198-.306a8.262 8.262 0 0 1-1.267-4.44c0-4.567 3.716-8.283 8.287-8.283a8.23 8.23 0 0 1 5.858 2.43 8.232 8.232 0 0 1 2.427 5.856 8.264 8.264 0 0 1-2.513 5.829Z",
  instagram:
    "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2Zm0 1.802c-2.67 0-2.987.01-4.04.059-.976.045-1.505.207-1.858.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.858-.05 1.053-.059 1.37-.059 4.039 0 2.67.01 2.986.059 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.684.566 1.15.748.353.137.882.3 1.858.344 1.053.05 1.37.059 4.04.059 2.67 0 2.987-.01 4.04-.059.976-.045 1.505-.207 1.858-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.858.05-1.053.059-1.37.059-4.04 0-2.669-.01-2.986-.059-4.04-.045-.975-.207-1.504-.344-1.857a3.09 3.09 0 0 0-.748-1.15 3.096 3.096 0 0 0-1.15-.748c-.353-.137-.882-.299-1.858-.344-1.053-.05-1.37-.059-4.04-.059Zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27Zm0 1.802a3.333 3.333 0 1 0 0 6.666 3.333 3.333 0 0 0 0-6.666Zm5.338-2.001a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  facebook:
    "M22 12.06C22 6.503 17.523 2 12 2S2 6.503 2 12.06c0 5.023 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.517 1.492-3.907 3.776-3.907 1.094 0 2.238.197 2.238.197v2.476h-1.26c-1.243 0-1.63.775-1.63 1.571v1.878h2.773l-.443 2.91h-2.33V22c4.78-.756 8.438-4.917 8.438-9.94Z",
  pinterest:
    "M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.429 1.809-2.429.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.996.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.846 0-4.516 2.135-4.516 4.34 0 .859.331 1.781.744 2.282a.3.3 0 0 1 .069.287c-.076.316-.245.995-.278 1.134-.043.183-.144.222-.332.134-1.24-.577-2.016-2.39-2.016-3.846 0-3.131 2.275-6.008 6.556-6.008 3.443 0 6.12 2.453 6.12 5.735 0 3.422-2.158 6.175-5.153 6.175-1.006 0-1.953-.523-2.277-1.14l-.619 2.36c-.224.863-.83 1.944-1.236 2.604.93.287 1.917.442 2.941.442 5.523 0 10-4.477 10-10S17.523 2 12 2Z",
  spotify:
    "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 1 1-.277-1.213c3.809-.871 7.077-.496 9.712 1.113a.623.623 0 0 1 .207.857Zm1.223-2.722a.779.779 0 0 1-1.072.257c-2.688-1.652-6.786-2.132-9.965-1.166a.779.779 0 1 1-.452-1.49c3.63-1.102 8.147-.568 11.232 1.327a.779.779 0 0 1 .257 1.072Zm.105-2.835C14.692 9.01 9.375 8.84 6.252 9.801a.935.935 0 1 1-.545-1.789c3.584-1.089 9.448-.878 13.18 1.352a.935.935 0 0 1-.973 1.502Z",
};

function FooterSocialIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path fill="currentColor" d={footerSocialIconPaths[name]} />
    </svg>
  );
}

// Instagram first and highlighted per the house's current priority: it's where
// most of the audience and engagement already is.
const footerSocialLinks = [
  { key: "instagram", label: "Instagram", handle: "@varandaype", href: "https://instagram.com/varandaype", highlight: true },
  { key: "whatsapp", label: "WhatsApp", handle: "Reservas e pedidos", href: whatsappUrl },
  { key: "facebook", label: "Facebook", handle: "@varandaype", href: "https://www.facebook.com/varandaype" },
  { key: "pinterest", label: "Pinterest", handle: "@varandaype", href: "https://br.pinterest.com/varandaype/" },
  { key: "spotify", label: "Spotify", handle: "Nossa trilha sonora", href: "https://open.spotify.com/user/31xybucv7sgbpfapyybyzu7s3ozu" },
];

function QualityReviewBanner() { return null; }

function TallyEmbed({ src, title }) {
  useEffect(() => {
    const loadEmbeds = () => {
      if (typeof window.Tally !== "undefined") {
        window.Tally.loadEmbeds();
        return;
      }
      document.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((frame) => {
        frame.src = frame.dataset.tallySrc;
      });
    };

    const scriptUrl = "https://tally.so/widgets/embed.js";
    const existing = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existing) {
      loadEmbeds();
      return;
    }

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = loadEmbeds;
    script.onerror = loadEmbeds;
    document.body.appendChild(script);
  }, []);

  return (
    <iframe
      data-tally-src={src}
      title={title}
      width="100%"
      height="600"
      loading="lazy"
    />
  );
}

function VacanciesEmbed() {
  useEffect(() => {
    const scriptUrl = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";
    const initialize = () => {
      if (typeof window.jotformEmbedHandler === "function") {
        window.jotformEmbedHandler("iframe[id='JotFormIFrame-262856749417068']", "https://form.jotform.com/");
      }
    };
    let script = document.querySelector(`script[src="${scriptUrl}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", initialize);
    initialize();
    return () => script.removeEventListener("load", initialize);
  }, []);

  return (
    <iframe
      id="JotFormIFrame-262856749417068"
      title="Contratações - VY"
      src="https://form.jotform.com/262856749417068"
      width="100%"
      height="539"
      loading="lazy"
      allow="fullscreen"
    />
  );
}

function CareersPage({ vacancies = false }) {
  return (
    <main className="satellite-page careers-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu/">Cardápio</a>
        <a className="delivery-header-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>
      <section className="satellite-hero">
        <div className="section-inner">
          <nav className="breadcrumbs" aria-label="Navegação estrutural">
            <a href="/">Início</a>
            <span>›</span>
            <span>Trabalhe Conosco</span>
          </nav>
          <p className="section-label">Trabalhe Conosco</p>
          <h1>Venha fazer parte do Varanda Ypê</h1>
          <p>
            Cadastre seu interesse para oportunidades no restaurante, atendimento,
            cozinha, salão, delivery e operação da casa.
          </p>
        </div>
      </section>
      <section className="careers-section section-cream">
        <Reveal className="section-inner careers-layout">
          <div className="careers-copy">
            <p className="section-label">Cadastro de interesse</p>
            <h2>Preencha seus dados com atenção</h2>
            <p>
              Usamos este cadastro para conhecer candidatos e organizar contatos
              quando houver vagas compatíveis com o perfil informado.
            </p>
            <div className="careers-points" aria-label="Áreas de interesse">
              <span>Salão</span>
              <span>Cozinha</span>
              <span>Atendimento</span>
              <span>Delivery</span>
            </div>
          </div>
          <div className="careers-embed">
            {vacancies ? (
              <VacanciesEmbed />
            ) : <TallyEmbed src={careersFormUrl} title="Trabalhe Conosco — Varanda Ypê" />}
            <a
              className="careers-fallback"
              href={vacancies ? "https://form.jotform.com/262856749417068" : "https://tally.so/r/A7E8Ql"}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent("careers_form_click", { location: "fallback" })}
            >
              Abrir formulário em outra aba
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}

// Every place someone can actually place an order. Kept as one list so the
// hero CTA, the /menu callout and the dedicated delivery section can't drift
// out of sync with each other.
const deliveryOptions = [
  {
    key: "99food-marmitaria",
    provider: "99Food",
    store: "Marmitaria Varanda Ypê",
    note: "Canal exclusivo da marmitaria",
    description:
      "Loja só de marmitas no 99Food, com o cardápio da marmitaria Varanda Ypê e entrega no almoço.",
    image: "/pratos/risoto-cuiabano.png",
    url: ninetyNineFoodMarmitariaUrl,
    tone: "ninetynine",
    cta: "Pedir marmita no 99Food",
    badge: "Novidade",
  },
  {
    key: "ifood",
    provider: "iFood",
    store: "Varanda Ypê",
    note: "Marmitas, executivos e grelhados",
    description: "Peça a linha Varanda Ypê pelo cardápio oficial do iFood.",
    image: "/pratos/chorizo.png",
    url: ifoodUrl,
    tone: "ifood",
    cta: "Pedir no iFood",
  },
  {
    key: "99food-varanda",
    provider: "99Food",
    store: "Varanda Ypê",
    note: "Marmitas, executivos e grelhados",
    description: "Encontre o cardápio Varanda Ypê também no 99Food.",
    image: "/pratos/fraldinha.png",
    url: ninetyNineFoodPrimaryUrl,
    tone: "ninetynine",
    cta: "Pedir no 99Food",
  },
  {
    key: "alloy",
    provider: "Alloy",
    store: "Pedido direto",
    note: "Pedido direto da loja · pontos e cashback",
    url: alloyUrl,
    tone: "alloy",
    cta: "Pedir pela Alloy",
  },
];

const orderBenefits = [
  ["Retirada ou entrega", "Escolha o canal e acompanhe o pedido pelo app."],
  ["Cardápio com preços", "Veja pratos, porções, espetinhos e bebidas antes de pedir."],
  ["Atendimento direto", "WhatsApp para reserva, dúvidas e pedidos para empresas."],
];

// Home "O que a casa tem" — real, in-context photography only (photo + title,
// overlaid caption, no price/description — full menu lives on /menu/). Stock
// product-shot photos (flat colored backdrop) are deliberately kept out so the
// grid doesn't mix two incompatible photography styles; categories without a
// real photo yet (marmitaria) stay off until one exists. `size` drives the
// bento layout: "featured" is the full-width opening banner, "wide" is a
// full-width closing banner, plain entries are the 3-across row between them.
const whatHouseHasCards = [
  { title: "Costela Varandeira", image: "/pratos/prato-familia-costela-picanha-varanda-ype-campinas.jpg", size: "featured" },
  { title: "Grelhados e executivos", image: "/pratos/frango-risoto-varanda-ype-campinas.jpg" },
  { title: "Espaço kids", image: "/ambiente/espaco-kids-visivel-familia-varanda-ype-campinas.jpg" },
  { title: "Jantinha com espetinhos", image: "/pratos/jantinha-2-espetos-varanda-ype-campinas.jpg" },
  { title: "Chopp e porções", image: "/ambiente/drinks-bar-smirnoff-varanda-ype-campinas.jpg", size: "wide" },
];

const visitHours = [
  ["Jantar", "Segunda a sábado, 18h às 23h"],
  ["Almoço", "Sábado e domingo, 11h às 15h"],
  ["Marmitaria / rotisseria", "Todos os dias, 11h às 14h30"],
];

const visitAddress = "Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia, Campinas/SP";
const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visitAddress)}`;

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

function MenuItem({ item, sectionId }) {
  const image = menuItemImages[item.name];

  return (
    <li className="online-menu-item">
      <div className="menu-item-copy">
        <div className="online-menu-line">
          <h3>{item.name}</h3>
          {item.price && <strong>{item.price}</strong>}
        </div>
        {item.meta && <p className="item-meta">{item.meta}</p>}
        {item.desc && <p>{item.desc}</p>}
      </div>
      <div className="menu-item-media">
        {image ? (
          <Img src={image} alt={item.name} width={180} height={180} />
        ) : (
          <div className="menu-item-placeholder" aria-hidden="true">
            <Img src="/logo-icon-96.png" alt="" width={58} height={58} />
          </div>
        )}
        {item.sundayOnly ? (
          <a
            className="menu-add-button menu-add-button-rotisseria"
            href={item.link}
            aria-label={`Ver ${item.name} na Rotisseria & Assados`}
            onClick={() =>
              trackEvent("menu_cross_link_click", {
                item: item.name,
                section: sectionId,
                destination: "rotisseria",
              })
            }
          >
            →
          </a>
        ) : (
          <a
            className="menu-add-button"
            href={alloyUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Pedir ${item.name} no pedido online, abre em outra aba`}
            onClick={() =>
              trackEvent("menu_add_click", {
                item: item.name,
                section: sectionId,
                destination: "alloy",
              })
            }
          >
            Pedir ↗
          </a>
        )}
      </div>
    </li>
  );
}

function OrderChannelsPanel() {
  return (
    <Reveal as="aside" className="order-channels-panel" aria-label="Onde pedir Varanda Ypê">
      <div className="order-panel-head">
        <span>🛵 Onde pedir</span>
        <h3>Peça do seu jeito</h3>
        <p>
          Escolha onde pedir. Confira a disponibilidade, a entrega e as promoções no canal escolhido.
        </p>
      </div>

      <div className="order-channel-list">
        {deliveryOptions.map((option) => (
          <a
            key={option.key}
            className={`order-channel-card order-channel-${option.tone}${option.badge ? " channel-highlight" : ""}`}
            href={option.url}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent("delivery_click", {
                provider: option.provider,
                channel: option.key,
                location: "menu_order_panel",
              })
            }
          >
            {option.badge && (
              <span className="channel-badge" aria-label={`${option.badge}: ${option.store}`}>
                ✨ {option.badge}
              </span>
            )}
            <strong>{option.provider}</strong>
            <span>{option.note}</span>
            <em>{option.cta}</em>
          </a>
        ))}
      </div>

      <div className="order-panel-note">
        <strong>Prefere conversar?</strong>
        <a href={whatsappUrl} target="_blank" rel="noreferrer">Fale com a gente pelo WhatsApp</a>
      </div>
    </Reveal>
  );
}

function OnlineMenuContent() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("todos");
  const searchableSections = useMemo(() => buildSearchableSections(), []);
  const totalMenuItems = searchableSections.reduce((sum, section) => sum + section.items.length, 0);
  const visibleSections = searchMenu(
    searchableSections.filter((section) => activeSection === "todos" || section.id === activeSection),
    query,
  );

  function selectSection(sectionId, title) {
    setActiveSection(sectionId);
    setQuery("");
    const filters = document.getElementById("menu-filters");
    if (filters && filters.getBoundingClientRect().top < 0) {
      filters.scrollIntoView({ block: "start", behavior: "instant" });
    }
    trackEvent("menu_filter_select", {
      section: sectionId,
      label: title,
    });
  }

  return (
    <section className="online-menu section-cream" id="cardapio-completo">
      <div className="section-inner">
        <div className="online-menu-head">
          <div>
            <p className="section-label">Cardápio completo online</p>
            <h1>Cardápio Varanda Ypê</h1>
          </div>
          <p>
            Pratos, porções, espetinhos e bebidas, com preços e acompanhamentos.
          </p>
        </div>

        <Reveal as="aside" className="store-order-panel menu-storefront-header" aria-label="Resumo da loja">
          <div className="store-logo-block">
            <Img src="/logo-icon-96.png" alt="" width={64} height={64} priority />
            <div>
              <strong>Varanda Ypê Grill & Executivos</strong>
              <span>Jardim Aurélia, Campinas • almoço, jantar e delivery</span>
            </div>
          </div>
          <div className="store-status-list">
            <span>{totalMenuItems} itens</span>
            <span>Jardim Aurélia · Campinas</span>
          </div>
          <a
            className="store-order-button"
            href={alloyUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("delivery_click", { provider: "Alloy", channel: "alloy", location: "store_order_panel" })}
          >
            Fazer pedido online
          </a>
        </Reveal>

        <div className="storefront-layout">
          <div className="storefront-main">
            <div className="menu-filter-card" id="menu-filters" aria-label="Filtros do cardápio">
              <label className="menu-search">
                <span>Buscar no cardápio</span>
                <input
                  type="search"
                  value={query}
                  placeholder="Ex.: fraldinha, fritas, chopp"
                  onInput={(event) => {
                    setQuery(event.target.value);
                    setActiveSection("todos");
                    trackEvent("menu_search_input", { has_query: event.target.value.trim().length > 0 });
                  }}
                />
              </label>
              <label className="menu-category-picker">
                <span>Categoria</span>
                <select value={activeSection} onChange={(event) => selectSection(event.target.value, event.target.selectedOptions[0].text)}>
                  <option value="todos">Todo o cardápio ({totalMenuItems})</option>
                  {searchableSections.map((section) => <option key={section.id} value={section.id}>{section.title} ({section.items.length})</option>)}
                </select>
              </label>
              <div className="menu-shortcuts" aria-label="Selecionar grupo do cardápio">
                <button
                  type="button"
                  className={activeSection === "todos" ? "is-active" : ""}
                  aria-pressed={activeSection === "todos"}
                  onClick={() => selectSection("todos", "Todos")}
                >
                  <span>★</span>
                  Todos
                  <small>{totalMenuItems}</small>
                </button>
                {searchableSections.map((section) => (
                  <button
                    type="button"
                    className={activeSection === section.id ? "is-active" : ""}
                    aria-pressed={activeSection === section.id}
                    key={section.id}
                    onClick={() => selectSection(section.id, section.title)}
                  >
                    <span>{section.emoji}</span>
                    {section.title}
                    <small>{section.items.length}</small>
                  </button>
                ))}
              </div>
            </div>

            <p className="menu-results" role="status" aria-live="polite">
              {visibleSections.reduce((sum, section) => sum + section.items.length, 0)} opções{query.trim() ? ` para “${query.trim()}”` : activeSection === "todos" ? " no cardápio" : ` em ${searchableSections.find((section) => section.id === activeSection)?.title}`}
              {query && <button type="button" onClick={() => setQuery("")}>Limpar busca</button>}
            </p>

            <div className="online-menu-grid">
              {visibleSections.map((section, index) => (
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
                      <h2>{section.title}</h2>
                      <p>{section.note}</p>
                    </div>
                  </header>
                  <ul>
                    {section.items.map((item) => (
                      <MenuItem item={item} sectionId={section.id} key={`${section.id}-${item.name}`} />
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
            {visibleSections.length === 0 && (
              <div className="menu-empty-state" role="status">
                <h3>Nenhum item encontrado</h3>
                <p>Tente buscar por outro prato ou veja todos os grupos do cardápio.</p>
                <button type="button" onClick={() => {
                  setQuery("");
                  setActiveSection("todos");
                }}>
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
          <OrderChannelsPanel />
        </div>
      </div>
    </section>
  );
}

// Structured data for /menu. Prices in the cardápio are free text
// ("R$ 52 / R$ 99", "R$ 10/un", ...); only emit an Offer when the value is a
// single clean "R$ NN" so we never ship a malformed price to Google.
function buildMenuSchema() {
  const priceRe = /^R\$\s?\d[\d.,]*$/;
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Cardápio Varanda Ypê",
    url: "https://varandaype.com/menu/",
    inLanguage: "pt-BR",
    provider: {
      "@type": "Restaurant",
      "@id": "https://varandaype.com/#restaurant",
      name: "Varanda Ypê",
    },
    hasMenuSection: fullMenuSections.map((section) => ({
      "@type": "MenuSection",
      name: section.title,
      description: section.note,
      hasMenuItem: section.items.map((item) => {
        const node = { "@type": "MenuItem", name: item.name };
        const description = [item.meta, item.desc].filter(Boolean).join(" — ");
        if (description) node.description = description;
        const price = (item.price || "").trim();
        if (priceRe.test(price)) {
          node.offers = {
            "@type": "Offer",
            price: price.replace(/[^\d,]/g, "").replace(",", "."),
            priceCurrency: "BRL",
            availability: "https://schema.org/InStock",
          };
        }
        return node;
      }),
    })),
  };
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
        <a className="delivery-header-button" href="/delivery/">
          Delivery
        </a>
        <a className="header-cta" href="/rotisseria/">
          Rotisseria (domingo)
        </a>
        <a className="header-cta" href="/empresa/">
          Empresas
        </a>
      </header>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildMenuSchema()) }}
      />
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
        <a className="header-cta" href="/menu/">
          Cardápio
        </a>
        <a className="ifood-header-button" href={companyWhatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>

      <section className="company-hero">
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
              <a className="button button-secondary" href="/menu/">
                Ver cardápio
              </a>
            </div>
          </div>
          <div className="company-plate">
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

function DiscoveryLinks({ currentSlug }) {
  return (
    <nav className="discovery-links" aria-label="Conheça o Varanda Ypê">
      <h2>Mais formas de conhecer a casa</h2>
      <div>
        {productPages.filter((page) => page.slug !== currentSlug).map((page) => (
          <a href={`/${page.slug}/`} key={page.slug}>{page.eyebrow}</a>
        ))}
        {discoveryPages.filter((page) => page.slug !== currentSlug).map((page) => (
          <a href={`/${page.slug}/`} key={page.slug}>{page.eyebrow}</a>
        ))}
        {currentSlug !== "rotisseria" && <a href="/rotisseria/">Rotisseria &amp; Assados</a>}
        <a href="/menu/">Ver cardápio completo</a>
      </div>
    </nav>
  );
}

export function SatellitePage({ page }) {
  const pageUrl = `https://varandaype.com/${page.slug}/`;
  const imageUrl = `https://varandaype.com${page.image}`;
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.intro,
    url: pageUrl,
    keywords: page.keywords,
    image: imageUrl,
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl: imageUrl,
      url: imageUrl,
      name: page.imageAlt,
      caption: page.imageAlt,
      representativeOfPage: true,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Varanda Ypê",
      url: "https://varandaype.com/",
    },
    about: {
      "@type": "Restaurant",
      "@id": "https://varandaype.com/#restaurant",
      name: "Varanda Ypê",
      alternateName: ["Varanda Ype", "Varanda Ypê - Jd. Aurélia"],
      telephone: "+551931991971",
      hasMenu: "https://varandaype.com/menu/",
      sameAs: [googleBusinessUrl, ifoodUrl, ninetyNineFoodPrimaryUrl, expressoUrl],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia",
        addressLocality: "Campinas",
        addressRegion: "SP",
        postalCode: "13033-010",
        addressCountry: "BR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -22.9010251,
        longitude: -47.09676,
      },
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: "https://varandaype.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: page.eyebrow,
        item: pageUrl,
      },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map(([question, answer]) => ({
      "@type": "Question", name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main className="satellite-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu/">Cardápio</a>
        <a className="delivery-header-button" href={whatsappUrl} target="_blank" rel="noreferrer">Reservar</a>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="satellite-hero">
        <div className="section-inner satellite-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><span>{page.eyebrow}</span></nav>
            <p className="section-label">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            {page.price && <strong className="product-price-badge">{page.price}</strong>}
            <p>{page.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="/menu/">Ver cardápio</a>
              <a className="button button-secondary" href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
            </div>
          </div>
          <Img src={page.image} alt={page.imageAlt} width={560} height={500} priority />
        </div>
      </section>
      <section className="satellite-content section-cream">
        <div className="section-inner satellite-section-grid">
          {page.sections.map(([title, copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}
        </div>
      </section>
      <section className="satellite-faq section-green">
        <div className="section-inner">
          <p className="section-label">Dúvidas frequentes</p><h2>Antes de visitar ou pedir</h2>
          <div className="faq-grid">{page.faqs.map(([question, answer]) => <article key={question}><h3>{question}</h3><p>{answer}</p></article>)}</div>
        </div>
      </section>
      <div className="section-inner"><DiscoveryLinks currentSlug={page.slug} /></div>
    </main>
  );
}

export function ProductPage({ page }) {
  const pageUrl = `https://varandaype.com/${page.slug}/`;
  const imageUrl = `https://varandaype.com${page.image}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.intro,
    url: pageUrl,
    keywords: page.keywords,
    image: imageUrl,
    primaryImageOfPage: {
      "@type": "ImageObject",
      contentUrl: imageUrl,
      url: imageUrl,
      name: page.imageAlt,
      caption: page.imageAlt,
      representativeOfPage: true,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Varanda Ypê",
      url: "https://varandaype.com/",
    },
    about: {
      "@type": "FoodEstablishment",
      name: "Varanda Ypê",
      address: "Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia, Campinas/SP",
    },
    ...(page.priceValue
      ? {
          mainEntity: {
            "@type": "MenuItem",
            name: page.title,
            description: page.intro,
            image: imageUrl,
            offers: {
              "@type": "Offer",
              price: page.priceValue,
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
              url: pageUrl,
            },
          },
        }
      : {}),
  };

  return (
    <main className="satellite-page product-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu/">Cardápio</a>
        <a className="delivery-header-button" href="/delivery/">Delivery</a>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="satellite-hero product-hero">
        <div className="section-inner satellite-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <span>›</span>
              <a href="/menu/">Cardápio</a>
              <span>›</span>
              <span>{page.eyebrow}</span>
            </nav>
            <p className="section-label">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={page.menuAnchor}>{page.orderLabel}</a>
              <a className="button button-secondary" href="/delivery/">Pedir delivery</a>
            </div>
          </div>
          <Img src={page.image} alt={page.imageAlt} width={560} height={500} priority />
        </div>
      </section>
      <section className="satellite-content section-cream">
        <div className="section-inner satellite-section-grid">
          {page.sections.map(([title, copy]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="satellite-faq section-green">
        <div className="section-inner">
          <p className="section-label">Dúvidas frequentes</p>
          <h2>Antes de pedir</h2>
          <div className="faq-grid">
            {page.faqs.map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="section-inner"><DiscoveryLinks currentSlug={page.slug} /></div>
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
        <header className="site-header" aria-label="Navegação principal">
          <a className="brand" href="/" aria-label="Início do Varanda Ypê">
            <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
            <span>Varanda Ypê</span>
          </a>
          <nav id="primary-nav" className={menuOpen ? "nav-open" : ""} onClick={() => setMenuOpen(false)}>
            <a href="/menu/">Cardápio</a>
            <a href="/rotisseria/">Rotisseria</a>
            <a href="/marmitaria/">Marmitaria</a>
            <a href="/vagas/">Vagas</a>
            <a href="/delivery/">Delivery</a>
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
          <a
            className="header-cta"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("whatsapp_click", { location: "header" })}
          >
            WhatsApp
          </a>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="signature">Comida brasileira • Boteco • Família</p>
            <h1>Restaurante no Jardim Aurélia para encontrar, celebrar e comer bem</h1>
            <p className="hero-text">
              Venha aproveitar comida brasileira, espaço kids, porções e chopp em
              Campinas. Reserve sua mesa ou conte também com delivery e marmitaria.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary button-delivery-hot"
                href="/delivery/"
                onClick={() =>
                  trackEvent("delivery_hub_click", { location: "hero" })
                }
              >
                Peço agora
              </a>
            </div>
            <div className="order-benefits" aria-label="Facilidades de pedido">
              {orderBenefits.map(([title, text]) => (
                <article key={title}>
                  <span />
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="hero-media" aria-label="Costela Varandeira, o carro-chefe da casa">
            <div className="hero-photo">
              <Img
                src="/pratos/prato-familia-costela-picanha-varanda-ype-campinas.jpg"
                smSrc="/pratos/prato-familia-costela-picanha-varanda-ype-campinas-sm.jpg"
                alt="Costela Varandeira, o prato carro-chefe do Varanda Ypê"
                width={560}
                height={700}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="gallery section-cream seam-hero" id="cardapio">
        <div className="section-inner">
          <Reveal as="div" className="section-heading">
            <p className="section-label">O que a casa tem</p>
            <h2>A casa por quem já experimentou</h2>
          </Reveal>
          <div className="gallery-grid">
            {whatHouseHasCards.map(({ title, image, size }, index) => (
              <Reveal
                as="article"
                className={`gallery-card${size ? ` gallery-card-${size}` : ""}`}
                key={title}
                delay={Math.min(index, 4) * 60}
              >
                <Img src={image} alt={title} width={size ? 640 : 320} height={size === "featured" ? 640 : 320} />
                <div className="gallery-card-caption">
                  <h3>{title}</h3>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="menu-full-link">
            <a href="/menu/">Ver cardápio completo</a>
          </p>
        </div>
      </section>

      <section className="visit section-cream seam-green" id="horarios">
        <Reveal className="section-inner experience-grid">
          <div className="round-photo">
            <Img
              src="/pratos/fraldinha.png"
              smSrc="/pratos/fraldinha-sm.png"
              alt="Fraldinha servida no Varanda Ypê"
              width={600}
              height={600}
            />
          </div>
          <div>
            <p className="section-label">Onde atende e quando</p>
            <h2>Venha almoçar, jantar ou buscar sua marmita</h2>
            <div className="experience-list">
              {visitHours.map(([title, text]) => (
                <article key={title}>
                  <span />
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="visit-address">{visitAddress}</p>
            <div className="hero-actions">
              <a className="button button-secondary-onlight" href={googleMapsUrl} target="_blank" rel="noreferrer">
                Ver no mapa
              </a>
              <a
                className="button button-delivery-hot"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "home_visit" })}
              >
                Reservar pelo WhatsApp
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="about section-cream" id="ambiente">
        <div className="section-inner">
          <Reveal as="div" className="about-head">
            <div>
              <p className="section-label">Ambiente familiar</p>
              <h2>Espaço amplo, aberto e confortável para a família inteira</h2>
            </div>
            <p>
              O Varanda Ypê foi revisado e reformado em 2026 para receber famílias
              com mais conforto, comodidade e lazer: salão aberto, excelente
              circulação de ar, rampas de acesso e espaço kids na visão dos
              familiares.
            </p>
          </Reveal>

          <AmbienceGallery />
        </div>
      </section>

      <div className="section-inner"><DiscoveryLinks /></div>
      <PaymentMethods />

      <footer className="footer" id="contato">
        <div className="section-inner footer-grid">
          <div>
            <Img src="/logo-icon-96.png" alt="" width={74} height={74} />
            <h2>Varanda Ypê</h2>
            <p>Comida brasileira • Boteco • Família</p>
          </div>
          <div>
            <h3>Siga e fale com a gente</h3>
            <div className="footer-social-grid">
              {footerSocialLinks.map((link) => (
                <a
                  key={link.key}
                  className={`footer-social-link${link.highlight ? " footer-social-highlight" : ""}`}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("social_link_click", { channel: link.key, location: "footer" })}
                >
                  <FooterSocialIcon name={link.key} />
                  <span>
                    <strong>{link.label}</strong>
                    <small>{link.handle}</small>
                  </span>
                </a>
              ))}
              <a
                className="footer-social-link"
                href="https://whatsapp.com/channel/0029VbAcHLXFSAsxCt6lly0a"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("whatsapp_channel_click", { location: "footer" })}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1Zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4ZM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6Z" /></svg>
                <span>
                  <strong>Canal do WhatsApp</strong>
                  <small>Promoções e novidades</small>
                </span>
              </a>
            </div>
            <a href="/privacidade/" className="footer-privacy-link">Privacidade</a>
            <p>Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia</p>
            <p><a className="footer-email-link" href="mailto:comercial@varandaype.com">comercial@varandaype.com</a></p>
          </div>
          <div>
            <h3>Horários</h3>
            <p>Presencial: jantar, segunda a sábado, 18h às 23h.</p>
            <p>Presencial: almoço, sábado e domingo, 11h às 15h.</p>
            <p>Marmitaria / rotisseria: todos os dias, 11h às 14h30.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export function PrivacyPage() {
  const sections = [
    [
      "Quem somos",
      "Este site é o site institucional do restaurante Varanda Ypê, na Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim Aurélia, Campinas/SP. O site é informativo: apresenta o cardápio, o ambiente e os canais de atendimento e de pedido. Não há cadastro, login ou pagamento dentro deste site.",
    ],
    [
      "Quais dados são tratados",
      "Navegação: ao acessar o site, o provedor de hospedagem (Cloudflare) registra dados técnicos padrão, como endereço IP, data e hora, páginas acessadas e tipo de navegador, para segurança e funcionamento do serviço. Contato e formulários: se você fala com a casa pelo WhatsApp ou preenche um dos formulários (cotação para empresas ou pesquisa de qualidade), trata-se dos dados que você mesmo informa, como nome, telefone, empresa e o conteúdo da mensagem. A pesquisa de qualidade é respondida de forma anônima.",
    ],
    [
      "Para que os dados são usados",
      "Para responder contatos e orçamentos, organizar pedidos e reservas, entender a satisfação dos clientes e melhorar o atendimento, e para manter o site seguro e no ar. Os dados não são vendidos.",
    ],
    [
      "Medição de audiência e anúncios",
      "O site usa um único Google Tag Manager para organizar Google Analytics 4, tags do Google Ads e Meta Pixel quando configurados. Essas ferramentas podem tratar dados de uso pseudonimizados, como páginas vistas, origem, dispositivo e interações. A análise, a publicidade e a personalização dependem da escolha feita no aviso de cookies e do Google Consent Mode v2. Os dados também são tratados por Google e Meta conforme suas políticas.",
    ],
    [
      "Outras ferramentas de terceiros",
      "Os formulários são hospedados pelo JotForm e pelo Tally, e as conversas de atendimento acontecem pelo WhatsApp (Meta); os dados enviados por esses canais são tratados também por essas plataformas, conforme as políticas delas. Os botões de delivery levam a iFood, 99Food e ao pedido direto (Expresso), que são serviços independentes, com políticas próprias. As fontes de texto são carregadas do Google Fonts.",
    ],
    [
      "Direcionamento e medição de delivery",
      "Nas páginas de pedido, registramos origem, página, intenção e canal escolhido somente quando a análise está permitida. Usamos IDs aleatórios de visitante, sessão e evento, além de first touch, last touch e touchpoints intermediários. A sessão é renovada após 30 minutos. IDs publicitários, como GCLID e FBCLID, exigem autorização de publicidade. Os links de pedido funcionam mesmo com rejeição ou falha do tracking. Clique é intenção, nunca compra. Purchase só poderá existir com confirmação real de pedido.",
    ],
    [
      "Cookies e como controlar",
      "Ao entrar no site, você pode aceitar tudo, rejeitar ou escolher separadamente análise, publicidade e personalização. Cookies necessários mantêm o site funcional. As preferências podem ser revistas nas páginas de pedido ou removendo os dados do site no navegador. Consulte também a Política de Cookies.",
    ],
    [
      "Seus direitos (LGPD)",
      "Você pode solicitar acesso, correção, atualização, portabilidade ou exclusão dos seus dados, revogar o consentimento e pedir informações sobre com quem eles são compartilhados. Para exercer esses direitos, fale com a casa pelo WhatsApp oficial. A retenção dos dados ocorre pelo tempo necessário às finalidades acima ou a obrigações legais.",
    ],
  ];

  return (
    <main className="satellite-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu/">Cardápio</a>
        <a className="delivery-header-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>
      <section className="satellite-hero">
        <div className="section-inner">
          <nav className="breadcrumbs" aria-label="Navegação estrutural">
            <a href="/">Início</a>
            <span>›</span>
            <span>Privacidade</span>
          </nav>
          <p className="section-label">Privacidade</p>
          <h1>Política de Privacidade</h1>
          <p>
            Como o Varanda Ypê trata os dados de quem visita este site e fala com
            a casa. Atualizada em setembro de 2026.
          </p>
        </div>
      </section>
      <section className="satellite-content section-cream">
        <div className="section-inner satellite-section-grid">
          {sections.map(([title, copy]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{copy}</p>
            </article>
          ))}
          <article>
            <h2>Contato</h2>
            <p>
              Dúvidas sobre privacidade ou sobre seus dados:{" "}
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp do Varanda Ypê
              </a>
              . Endereço: Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Jardim
              Aurélia, Campinas/SP.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

export function CookiesPage() {
  const items = [
    ["Necessários", "Mantêm segurança, funcionamento e a preferência de consentimento. Não podem ser desativados pelo painel."],
    ["Análise", "Quando autorizada, registra páginas, intenção, origem de campanha e cliques para entender o desempenho. Usa identificadores aleatórios vy_vid e vy_sid."],
    ["Publicidade", "Quando autorizada, permite tratar click IDs e acionar tags publicitárias configuradas no GTM para mensuração e remarketing."],
    ["Personalização", "Quando autorizada, permite adaptar experiências e públicos de marketing conforme a configuração das plataformas."],
    ["Prazo", "A sessão usa uma janela de 30 minutos. O identificador anônimo de visitante pode persistir por até 12 meses; eventos obedecem à retenção operacional e legal aplicável."],
  ];
  return <main className="satellite-page"><header className="menu-page-header"><a className="brand" href="/"><Img src="/logo-icon-96.png" alt="" width={52} height={52} priority /><span>Varanda Ypê</span></a><a className="header-cta" href="/privacidade/">Privacidade</a></header><section className="satellite-hero"><div className="section-inner"><nav className="breadcrumbs" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><span>Cookies</span></nav><p className="section-label">Transparência</p><h1>Política de Cookies</h1><p>Controle claro sobre medição, publicidade e personalização. Atualizada em setembro de 2026.</p></div></section><section className="satellite-content section-cream"><div className="section-inner satellite-section-grid">{items.map(([title, copy]) => <article key={title}><h2>{title}</h2><p>{copy}</p></article>)}</div></section></main>;
}

export function RotisseriaPage() {
  const pageUrl = "https://varandaype.com/rotisseria/";
  const shareImageUrl = `https://varandaype.com${rotisseriaShareImage}`;
  const priceToNumber = (value) => value.replace(",", ".");
  const menuSchema = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Rotisseria & Assados Varanda Ypê",
    url: pageUrl,
    inLanguage: "pt-BR",
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "Assados",
        hasMenuItem: rotisseriaAssados.flatMap((item) =>
          ["1 kg", "500 g", "250 g"].map((size, index) => ({
            "@type": "MenuItem",
            name: `${item.name} - ${size}`,
            offers: { "@type": "Offer", price: priceToNumber(item.prices[index]), priceCurrency: "BRL" },
          })),
        ),
      },
      {
        "@type": "MenuSection",
        name: "Frango assado",
        hasMenuItem: [{
          "@type": "MenuItem",
          name: "Frango assado com farofa artesanal e batatinhas assadas",
          offers: { "@type": "Offer", price: "48.90", priceCurrency: "BRL" },
        }],
      },
    ],
  };
  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Rotisseria & Assados | Varanda Ypê",
    description: "Assados no celofane, preparados no carvão, aos domingos com delivery e retirada em Campinas.",
    url: pageUrl,
    image: shareImageUrl,
    isPartOf: { "@type": "WebSite", name: "Varanda Ypê", url: "https://varandaype.com/" },
    about: {
      "@type": "FoodEstablishment",
      name: "Varanda Ypê",
      address: "Av. Brigadeiro Rafael Tobias de Aguiar, 1121 - Jardim Aurélia, Campinas/SP",
    },
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rotisseriaFaqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  const trackWhatsapp = (position) => () =>
    trackEvent("whatsapp_click", {
      operation: "rotisseria",
      partner: "whatsapp",
      destination_id: "whatsapp_rotisseria",
      cta_position: position,
      location: "rotisseria_page",
    });

  return (
    <main className="satellite-page product-page rotisseria-page">
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <Img src="/logo-icon-96.png" alt="" width={52} height={52} priority />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu/">Cardápio</a>
        <a className="delivery-header-button" href="/delivery/">Delivery</a>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="satellite-hero product-hero">
        <div className="section-inner satellite-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <span>›</span>
              <span>Rotisseria &amp; Assados</span>
            </nav>
            <p className="section-label">Domingo na Varanda</p>
            <h1>Rotisseria &amp; Assados</h1>
            <p>Assados no celofane, preparados no carvão. Cupim, costela, lombo recheado, frango assado e acompanhamentos para o almoço de domingo, com delivery e retirada em Campinas.</p>
            <p className="rotisseria-hours"><strong>Domingos, das 11h às 15h</strong></p>
            <div className="hero-actions">
              <a className="button button-primary" href={rotisseriaWhatsappUrl} target="_blank" rel="noreferrer" onClick={trackWhatsapp("hero")}>Pedir pelo WhatsApp</a>
              <a className="button button-secondary" href="/delivery/marmitas/">Pedir delivery</a>
            </div>
          </div>
          <Img src={rotisseriaImage} alt="Frango assado dourado sobre tábua de madeira, da Rotisseria & Assados do Varanda Ypê" width={897} height={627} priority />
        </div>
      </section>
      <nav className="rotisseria-jump" aria-label="Nesta página">
        <div className="section-inner">
          <a href="#assados-title">Assados</a>
          <a href="#frango-assado">Frango assado</a>
          <a href="#acompanhamentos">Acompanhamentos</a>
          <a href="#duvidas">Dúvidas</a>
        </div>
      </nav>
      <section className="satellite-content section-cream rotisseria-menu" aria-labelledby="assados-title">
        <div className="section-inner">
          <p className="section-label">Cardápio de domingo</p>
          <h2 id="assados-title">Assados por peso</h2>
          <p className="rotisseria-lead">Escolha a porção que combina com a mesa: 1 kg, 500 g ou 250 g.</p>
          <div className="rotisseria-table-wrap">
            <table className="rotisseria-table">
              <caption className="sr-only">Preços dos assados por porção</caption>
              <thead>
                <tr><th scope="col">Assado</th><th scope="col">1 kg</th><th scope="col">500 g</th><th scope="col">250 g</th></tr>
              </thead>
              <tbody>
                {rotisseriaAssados.map((item) => (
                  <tr key={item.name}>
                    <th scope="row">
                      {item.name}
                      {item.note === "Novidade" ? <span className="rotisseria-badge">Novidade</span> : item.note ? <small>{item.note}</small> : null}
                    </th>
                    {item.prices.map((price, index) => <td key={index} data-label={["1 kg", "500 g", "250 g"][index]}>R$ {price}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <article className="rotisseria-frango" id="frango-assado">
            <Img src={rotisseriaImage} alt="Frango assado dourado sobre tábua de madeira" width={897} height={627} />
            <div>
              <p className="section-label">Destaque</p>
              <h3>Frango assado</h3>
              <p className="rotisseria-price">R$ 48,90 <span>/ unidade</span></p>
              <p>Acompanha farofa artesanal e batatinhas assadas.</p>
              <a className="button button-primary" href={rotisseriaWhatsappUrl} target="_blank" rel="noreferrer" onClick={trackWhatsapp("frango")}>Pedir frango assado</a>
            </div>
          </article>
          <h2 className="rotisseria-subtitle" id="acompanhamentos">Acompanhamentos</h2>
          <ul className="rotisseria-sides">
            {rotisseriaAcompanhamentos.map(([name, options]) => (
              <li key={name}>
                <strong>{name}</strong>
                <span>{options.join("  |  ")}</span>
              </li>
            ))}
          </ul>
          <p className="rotisseria-note"><strong>Preços conforme o cardápio.</strong> Confira a disponibilidade direto na loja ou no site varandaype.com antes de fazer o pedido.</p>
          <div className="hero-actions">
            <a className="button button-primary" href={rotisseriaWhatsappUrl} target="_blank" rel="noreferrer" onClick={trackWhatsapp("menu")}>Pedir pelo WhatsApp</a>
            <a className="button button-secondary" href="/delivery/marmitas/">Ver canais de delivery</a>
          </div>
        </div>
      </section>
      <section className="satellite-faq section-green" id="duvidas">
        <div className="section-inner">
          <p className="section-label">Dúvidas frequentes</p>
          <h2>Antes de pedir</h2>
          <div className="faq-grid">
            {rotisseriaFaqs.map(([question, answer]) => (
              <article key={question}>
                <h3>{question}</h3>
                <p>{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="section-inner"><DiscoveryLinks currentSlug="rotisseria" /></div>
    </main>
  );
}

function App({ initialPath } = {}) {
  const currentPath =
    initialPath || (typeof window === "undefined" ? "/" : window.location.pathname);
  const route = currentPath.replace(/\/$/, "");
  if (route === '/delivery') return <React.Suspense><DeliveryRouter /></React.Suspense>;
  const deliveryOperation = route.match(/^\/delivery\/(restaurante|marmitas)$/)?.[1];
  if (deliveryOperation) return <React.Suspense><DeliveryRouter operation={deliveryOperation} /></React.Suspense>;
  if (route === '/pedir') return <React.Suspense><MarketingRouter /></React.Suspense>;
  const marketingPlatform = route.match(/^\/pedir\/(ifood|99food|direto)$/)?.[1];
  if (marketingPlatform) return <React.Suspense><MarketingRouter platform={marketingPlatform} /></React.Suspense>;

  // /ifood, /99, /99food are handled at the edge by public/_redirects
  // (and public/ifood/index.html as a static fallback), so they never reach
  // the React app.

  let page;
  if (route === "/menu") {
    page = <MenuPage />;
  } else if (route === "/empresa") {
    page = <CompanyPage />;
  } else if (route === "/vagas") {
    page = <CareersPage vacancies />;
  } else if (route === "/trabalhe-conosco") {
    page = <CareersPage />;
  } else if (route === "/privacidade") {
    page = <PrivacyPage />;
  } else if (route === "/cookies") {
    page = <CookiesPage />;
  } else if (route === "/rotisseria") {
    page = <RotisseriaPage />;
  } else if (route === "/marmitaria") {
    page = <MarmitariaPage />;
  } else {
    const productPage = productPages.find((item) => route === `/${item.slug}`);
    const discoveryPage = discoveryPages.find((item) => route === `/${item.slug}`);
    if (productPage) {
      page = <ProductPage page={productPage} />;
    } else {
      page = discoveryPage ? <SatellitePage page={discoveryPage} /> : <HomePage />;
    }
  }

  return (
    <>
      <MarketingTracker route={route || "/"} />
      {route === "" && <WhatsAppChannelBanner />}
      {!["/trabalhe-conosco", "/vagas"].includes(route) && <QualityReviewBanner />}
      {page}
      <CookieConsent />
      <FloatingWhatsapp route={route} />
    </>
  );
}

export default App;
