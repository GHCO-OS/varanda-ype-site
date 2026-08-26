import React, { useEffect, useState } from "react";
import { Reveal } from "./Reveal.jsx";

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
      onClick={() => trackEvent("whatsapp_click", { location: "floating_button" })}
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

const ifoodUrl =
  "https://www.ifood.com.br/delivery/campinas-sp/varanda-ype---grill--executivos-jardim-aurelia/2ba9a14c-3df9-4725-8b6b-1294c2c1b156";
const ninetyNineFoodPrimaryUrl = "https://oia.99app.com/dlp9/C94oJv?area=BR";
const ninetyNineFoodSecondaryUrl = "https://oia.99app.com/dlp9/ceXoR0?area=BR";
const expressoUrl = "https://expresso.varandaype.com";
const whatsappUrl = "https://wa.me/551931991971";
const companyWhatsappUrl =
  "https://wa.me/551931991971?text=Ol%C3%A1%2C%20quero%20falar%20sobre%20pedido%20para%20empresa%20no%20Varanda%20Yp%C3%AA.";
const whatsappFloatingUrl = whatsappUrl;
const googleBusinessUrl = "https://share.google/pxyfGTy3KNNdToPxk";
const companyFormUrl = "https://form.jotform.com/262195555788070";
const qualityReviewUrl = "https://form.jotform.com/262324465405050";

export const productPages = [
  {
    slug: "pratos-executivos-campinas",
    eyebrow: "Pratos executivos",
    title: "Pratos executivos no Jardim Aurélia",
    intro:
      "Almoço bem servido em Campinas com pratos executivos, grelhados, massas, risotos e acompanhamentos brasileiros no Varanda Ypê.",
    image: "/pratos/chorizo.png",
    imageAlt: "Prato executivo servido no Varanda Ypê em Campinas",
    menuAnchor: "/menu#la-carte",
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
    menuAnchor: "/menu#espetinhos",
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
    menuAnchor: "/menu#parmegiana-familia",
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
    menuAnchor: "/menu",
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
    menuAnchor: "/empresa",
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
    menuAnchor: "/menu",
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
      "Procure por Varanda Ypê ou Varanda Ype em Campinas para achar a casa nos canais de pedido, mapas, delivery e sugestões de local.",
    image: "/pratos/chorizo.png",
    imageAlt: "Prato executivo do Varanda Ypê disponível para pedido em Campinas",
    sections: [
      [
        "Nome igual em todos os lugares",
        "Para facilitar a busca em apps como 99, 99Food, Uber, iFood, Google e mapas, use os nomes Varanda Ypê e Varanda Ype junto do bairro Jardim Aurélia ou da cidade Campinas.",
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
      ["Como procurar o Varanda Ypê nos apps?", "Busque por Varanda Ypê, Varanda Ype, restaurante Jardim Aurélia ou pelo endereço Av. Brigadeiro Rafael Tobias de Aguiar, 1121, Campinas."],
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

function QualityReviewBanner() {
  return (
    <aside className="quality-review-banner" aria-label="Avaliação anônima de qualidade">
      <div>
        <strong>Avalie sua experiência no Varanda Ypê</strong>
        <span>Pesquisa anônima de qualidade. Sua opinião ajuda a casa a servir melhor.</span>
      </div>
      <a
        href={qualityReviewUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => trackEvent("quality_review_click", { location: "top_banner" })}
      >
        Avaliar agora
      </a>
    </aside>
  );
}

// Every place someone can actually place an order. Kept as one list so the
// hero CTA, the /menu callout and the dedicated delivery section can't drift
// out of sync with each other.
const deliveryOptions = [
  {
    key: "99food-principal",
    provider: "99Food",
    note: "App principal",
    url: ninetyNineFoodPrimaryUrl,
    tone: "ninetynine",
    cta: "99Food principal",
  },
  {
    key: "99food-secundaria",
    provider: "99Food",
    note: "Link alternativo",
    url: ninetyNineFoodSecondaryUrl,
    tone: "ninetynine",
    cta: "99Food alternativo",
  },
  {
    key: "ifood",
    provider: "iFood",
    note: "Delivery oficial",
    url: ifoodUrl,
    tone: "ifood",
    cta: "Pedir no iFood",
  },
  {
    key: "expresso",
    provider: "Expresso",
    note: "Direto da loja · só no almoço · acumula pontos e cashback",
    url: expressoUrl,
    tone: "expresso",
    cta: "Pedir no Expresso",
  },
];

const quickGroups = [
  ["Executivos", "Pratos do dia para almoço", "/menu#la-carte"],
  ["Porções", "Boteco para compartilhar", "/#porcoes"],
  ["Espetinhos", "Jantar leve e direto", "/menu#espetinhos"],
  ["Chopp", "Mesa com amigos", "/menu#bebidas"],
  ["Família", "Espaço kids", "/#horarios"],
];

const orderBenefits = [
  ["Retirada ou entrega", "Escolha o canal e acompanhe o pedido pelo app."],
  ["Cardápio com preços", "Veja pratos, porções, espetinhos e bebidas antes de pedir."],
  ["Atendimento direto", "WhatsApp para reserva, dúvidas e pedidos para empresas."],
];

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

const menuItemImages = {
  "Fraldinha Assada": "/pratos/fraldinha.png",
  "Risoto Cuiabano": "/pratos/risoto-cuiabano.png",
  "Talharim 4Q": "/pratos/talharim.png",
  "Calabresa com fritas": "/porcoes/calabresa-com-fritas.png",
  "Fritas clássica": "/porcoes/fritas-500g.png",
  "Isca de mignon": "/porcoes/isca-cordao-mignon.png",
  "Isca de tilápia": "/porcoes/isca-frango-milanesa.png",
  "Linguiça Cuiabana": "/porcoes/calabresa-com-fritas.png",
  "Jantinha Expressa": "/pratos/jantinha-2-espetos-varanda-ype-campinas.jpg",
};

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
        desc: "2 espetos com arroz, feijão, farofa e vinagrete ou saladinha.",
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
        <a
          className="menu-add-button"
          href={expressoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Pedir ${item.name} no Expresso`}
          onClick={() =>
            trackEvent("menu_add_click", {
              item: item.name,
              section: sectionId,
              destination: "expresso",
            })
          }
        >
          +
        </a>
      </div>
    </li>
  );
}

function OnlineMenuContent() {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState("todos");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const visibleSections = fullMenuSections
    .filter((section) => activeSection === "todos" || section.id === activeSection)
    .map((section) => ({
      ...section,
      items: normalizedQuery
        ? section.items.filter((item) =>
            [item.name, item.meta, item.desc]
              .filter(Boolean)
              .join(" ")
              .toLocaleLowerCase("pt-BR")
              .includes(normalizedQuery),
          )
        : section.items,
    }))
    .filter((section) => section.items.length > 0);

  function selectSection(sectionId, title) {
    setActiveSection(sectionId);
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
            <h2>Leve para abrir, fácil de escolher</h2>
          </div>
          <p>
            Aqui tem comida de casa, grelhados, espetinhos, porções e bebidas
            para escolher com calma antes de chegar ou pedir.
          </p>
        </div>

        <Reveal as="aside" className="store-order-panel" aria-label="Resumo da loja">
          <div className="store-logo-block">
            <Img src="/logo-icon-96.png" alt="" width={64} height={64} priority />
            <div>
              <strong>Expresso Varanda Ypê</strong>
              <span>Pedido próprio • pontos e cashback</span>
            </div>
          </div>
          <div className="store-status-list">
            <span>Almoço no Expresso</span>
            <span>Entrega ou retirada</span>
            <span>WhatsApp para dúvidas</span>
          </div>
          <a
            className="store-order-button"
            href={expressoUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent("delivery_click", { provider: "Expresso", channel: "expresso", location: "store_order_panel" })}
          >
            Abrir pedidos
          </a>
        </Reveal>

        <Reveal as="aside" className="delivery-callout" aria-label="Opções de delivery">
          <div>
            <span>🛵 Delivery</span>
            <h3>Peça Varanda Ypê sem sair de casa</h3>
            <p>
              Escolha o app ou canal que preferir para ver disponibilidade,
              promoções e formas de entrega.
            </p>
          </div>
          <div className="delivery-callout-actions">
            {deliveryOptions.map((option) => (
              <a
                key={option.key}
                className={`delivery-button delivery-button-${option.tone}`}
                href={option.url}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("delivery_click", {
                    provider: option.provider,
                    channel: option.key,
                    location: "menu_callout",
                  })
                }
              >
                {option.cta}
              </a>
            ))}
          </div>
        </Reveal>

        <div className="menu-filter-card" aria-label="Filtros do cardápio">
          <label className="menu-search">
            <span>Buscar no cardápio</span>
            <input
              type="search"
              value={query}
              placeholder="Ex.: fraldinha, fritas, chopp"
              onChange={(event) => {
                setQuery(event.target.value);
                trackEvent("menu_search_input", { has_query: event.target.value.trim().length > 0 });
              }}
            />
          </label>
          <div className="menu-shortcuts" aria-label="Selecionar grupo do cardápio">
            <button
              type="button"
              className={activeSection === "todos" ? "is-active" : ""}
              onClick={() => selectSection("todos", "Todos")}
            >
              <span>★</span>
              Todos
            </button>
            {fullMenuSections.map((section) => (
              <button
                type="button"
                className={activeSection === section.id ? "is-active" : ""}
                key={section.id}
                onClick={() => selectSection(section.id, section.title)}
              >
                <span>{section.emoji}</span>
                {section.title}
              </button>
            ))}
          </div>
        </div>

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
                  <h3>{section.title}</h3>
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
        <a className="delivery-header-button" href="/#delivery">
          Delivery
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
        {discoveryPages.filter((page) => page.slug !== currentSlug).map((page) => (
          <a href={`/${page.slug}`} key={page.slug}>{page.eyebrow}</a>
        ))}
        <a href="/menu">Ver cardápio completo</a>
      </div>
    </nav>
  );
}

export function SatellitePage({ page }) {
  const pageUrl = `https://varandaype.com/${page.slug}`;
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
      hasMenu: "https://varandaype.com/menu",
      sameAs: [googleBusinessUrl, ifoodUrl, ninetyNineFoodPrimaryUrl, expressoUrl],
      address: {
        "@type": "PostalAddress",
        streetAddress: "Av. Brigadeiro Rafael Tobias de Aguiar, 1121",
        addressLocality: "Campinas",
        addressRegion: "SP",
        addressCountry: "BR",
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
        <a className="header-cta" href="/menu">Cardápio</a>
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
              <a className="button button-primary" href="/menu">Ver cardápio</a>
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
        <a className="header-cta" href="/menu">Cardápio</a>
        <a className="delivery-header-button" href={ifoodUrl} target="_blank" rel="noreferrer">Delivery</a>
      </header>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="satellite-hero product-hero">
        <div className="section-inner satellite-hero-grid">
          <div>
            <nav className="breadcrumbs" aria-label="Navegação estrutural">
              <a href="/">Início</a>
              <span>›</span>
              <a href="/menu">Cardápio</a>
              <span>›</span>
              <span>{page.eyebrow}</span>
            </nav>
            <p className="section-label">{page.eyebrow}</p>
            <h1>{page.title}</h1>
            <p>{page.intro}</p>
            <div className="hero-actions">
              <a className="button button-primary" href={page.menuAnchor}>{page.orderLabel}</a>
              <a className="button button-secondary" href={ifoodUrl} target="_blank" rel="noreferrer">Pedir delivery</a>
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
            <a href="/menu">Cardápio</a>
            <a href="/empresa">Empresas</a>
            <a href="#pedido">Pedido online</a>
            <a href="#delivery">Delivery</a>
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
          <div className="hero-utility-grid" aria-label="Informações e facilidades do Varanda Ypê">
            <article className="hero-utility-card">
              <span className="hero-utility-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>
              </span>
              <div>
                <strong>Horários da casa</strong>
                <span>Jantar: seg. a sáb. · 18h às 23h</span>
                <small>Almoço: sáb. e dom. · 11h às 15h</small>
                <small>Marmitaria: todos os dias · 11h às 14h30</small>
              </div>
            </article>
            <a className="hero-utility-card" href="https://whatsapp.com/channel/0029VbAcHLXFSAsxCt6lly0a" target="_blank" rel="noreferrer" aria-label="Abrir o canal do Varanda Ypê no WhatsApp">
              <span className="hero-utility-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-12 6.9L4 20l1.6-3.8A8 8 0 1 1 20 11.5Z"/><path d="M9 9.5c.8 2 2 3.2 4 4"/></svg>
              </span>
              <div>
                <strong>Canal no WhatsApp</strong>
                <span>Novidades direto da casa</span>
                <small>Seguir o canal</small>
              </div>
            </a>
            <a className="hero-utility-card" href="https://expresso.varandaype.com/loja/fidelidade" target="_blank" rel="noreferrer">
              <span className="hero-utility-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M12 7v13M4 11h16M8.5 7C6 7 6 3.5 8 3.5c2.2 0 4 3.5 4 3.5M15.5 7c2.5 0 2.5-3.5.5-3.5-2.2 0-4 3.5-4 3.5"/></svg>
              </span>
              <div>
                <strong>Programa de fidelidade</strong>
                <span>Acumule pontos e cashback</span>
                <small>Conheça os benefícios</small>
              </div>
            </a>
          </div>
          <div className="hero-copy">
            <p className="signature">Comida brasileira • Boteco • Família</p>
            <h1>Restaurante no Jardim Aurélia para almoço, jantar e delivery</h1>
            <p className="hero-text">
              Pratos executivos, espetinhos, porções, chopp e espaço kids em
              Campinas. Venha para a mesa ou peça pelos canais de delivery.
            </p>
            <div className="quick-groups" aria-label="Escolha rápida por ocasião">
              {quickGroups.map(([title, text, href]) => (
                <a
                  href={href}
                  key={title}
                  onClick={() => trackEvent("quick_group_click", { label: title, location: "hero" })}
                >
                  <strong>{title}</strong>
                  <span>{text}</span>
                </a>
              ))}
            </div>
            <div className="hero-actions">
              <a className="button button-primary" href="/menu">
                Ver cardápio
              </a>
              <a
                className="button button-secondary button-delivery-hot"
                href={ifoodUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("delivery_click", {
                    provider: "iFood",
                    channel: "ifood",
                    location: "hero_primary",
                  })
                }
              >
                Pedir no iFood
              </a>
              <a
                className="button button-secondary"
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("whatsapp_click", { location: "hero" })}
              >
                Reservar mesa
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

          <div className="hero-media" aria-label="Mesa brasileira servida">
            <div className="hero-photo">
              <Img
                src="/pratos/chorizo.png"
                smSrc="/pratos/chorizo-sm.png"
                alt="Chorizo executivo servido no Varanda Ypê"
                width={560}
                height={560}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="order-preview section-cream" id="pedido">
        <div className="section-inner">
          <Reveal as="div" className="section-heading">
            <p className="section-label">Pedido online</p>
            <h2>Escolha como se estivesse no Expresso</h2>
          </Reveal>
          <div className="order-preview-shell">
            <div className="order-preview-top">
              <div className="store-logo-block">
                <Img src="/logo-icon-96.png" alt="" width={58} height={58} />
                <div>
                  <strong>Expresso Varanda Ypê</strong>
                  <span>Direto da loja, com pontos e cashback</span>
                </div>
              </div>
              <a
                className="store-order-button"
                href={expressoUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("delivery_click", { provider: "Expresso", channel: "expresso", location: "home_order_preview" })}
              >
                Pedir agora
              </a>
            </div>
            <div className="order-preview-categories" aria-label="Categorias de pedido">
              {quickGroups.slice(0, 4).map(([title, text, href]) => (
                <a href={href} key={title}>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </a>
              ))}
            </div>
            <div className="order-preview-products">
              {menuHighlights.slice(0, 3).map((item) => (
                <article key={item.title}>
                  <Img src={item.image} smSrc={item.image.replace(/\.png$/, "-sm.png")} alt={item.title} width={180} height={180} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                    <a
                      href={expressoUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Pedir ${item.title} no Expresso`}
                      onClick={() => trackEvent("menu_add_click", { item: item.title, section: "home_preview", destination: "expresso" })}
                    >
                      +
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="delivery section-cream seam-hero" id="delivery">
        <div className="section-inner">
          <Reveal as="div" className="section-heading">
            <p className="section-label">Peça sem sair de casa</p>
            <h2>Escolha por onde prefere pedir</h2>
          </Reveal>
          <div className="delivery-grid">
            {deliveryOptions.map((option, index) => (
              <Reveal
                as="article"
                className="delivery-card"
                key={option.key}
                delay={Math.min(index, 3) * 70}
              >
                <span className="delivery-provider">{option.provider}</span>
                <p>{option.note}</p>
                <a
                className={`delivery-button delivery-button-${option.tone}`}
                href={option.url}
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackEvent("delivery_click", {
                    provider: option.provider,
                    channel: option.key,
                    location: "home_delivery_section",
                  })
                }
              >
                {option.cta}
              </a>
              </Reveal>
            ))}
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

      <section className="menu section-green seam-cream" id="cardapio">
        <div className="section-inner">
          <Reveal as="div" className="section-heading">
            <p className="section-label">Cardápio</p>
            <h2>Destaques para pedir sem pensar muito</h2>
          </Reveal>
          <div className="menu-list">
            {menuHighlights.map((item, index) => (
              <Reveal as="article" className="dish" key={item.title} delay={Math.min(index, 3) * 80}>
                <div className="dish-media">
                  <Img
                    className="dish-photo"
                    src={item.image}
                    smSrc={item.image.replace(/\.png$/, "-sm.png")}
                    alt={item.title}
                    width={420}
                    height={290}
                  />
                </div>
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

      <section className="gallery section-cream seam-green" id="porcoes">
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

      <div className="section-inner"><DiscoveryLinks /></div>

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
            <a href="#delivery">Peça delivery</a>
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
            <p>Presencial: jantar, segunda a sábado, 18h às 23h.</p>
            <p>Presencial: almoço, sábado e domingo, 11h às 15h.</p>
            <p>Marmitaria / rotisseria: todos os dias, 11h às 14h30.</p>
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
      <QualityReviewBanner />
      {page}
      <FloatingWhatsapp />
    </>
  );
}

export default App;
