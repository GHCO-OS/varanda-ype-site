import React from "react";
import { useGsap } from "./lib/useGsap.js";
import "./marmitaria.css";

const whatsappUrl = "https://wa.me/551931991971";

// Photo + name + description only — no prices, since the marmitaria's daily
// options vary. Images are no-background product cutouts from the kitchen's
// photo set, shown here as a visual menu, not a priced order form.
const dishes = [
  { slug: "costela-assada", title: "Costela Assada", desc: "Assada lentamente até soltar do osso." },
  { slug: "frango-assado", title: "Frango Assado", desc: "Dourado no espeto, suculento por dentro." },
  { slug: "cupim", title: "Cupim", desc: "Carne nobre, macia e com sabor de churrasco." },
  { slug: "pernil-ao-molho", title: "Pernil ao Molho", desc: "Pernil suíno fatiado, no molho da casa." },
  { slug: "sobrecoxa", title: "Sobrecoxa", desc: "Frango suculento, temperado e bem dourado." },
  { slug: "lombo", title: "Lombo", desc: "Lombo suíno fatiado e temperado." },
  { slug: "pancetta", title: "Pancetta", desc: "Fatias crocantes de barriga de porco." },
  { slug: "bife-a-vilalva", title: "Bife à Vilalvá", desc: "Empanado, coberto de queijo, com fritas e salada." },
  { slug: "frango-a-milanesa", title: "Frango à Milanesa", desc: "Empanado e crocante por fora, macio por dentro." },
  { slug: "frango-grelhado", title: "Frango Grelhado", desc: "Peito de frango grelhado no ponto certo." },
  { slug: "medalhao-de-frango", title: "Medalhão de Frango com Bacon", desc: "Enrolado no bacon, com legumes e arroz." },
  { slug: "contra-file-a-moda", title: "Contra-filé à Moda da Casa", desc: "Grelhado, com um toque cremoso por cima." },
  { slug: "parmegiana", title: "Parmegiana", desc: "Empanada, coberta de molho e queijo gratinado." },
  { slug: "bife-grelhado", title: "Bife Grelhado", desc: "Corte suculento, grelhado na hora." },
  { slug: "steak", title: "Steak", desc: "Corte generoso, grelhado ao ponto." },
  { slug: "carne-de-panela", title: "Carne de Panela", desc: "Cozida lentamente até desmanchar." },
  { slug: "churrasco", title: "Churrasco", desc: "Carnes grelhadas no estilo boteco." },
  { slug: "vaca-atolada", title: "Vaca Atolada", desc: "Carne e mandioca cozidas no caldo encorpado." },
  { slug: "virado-a-paulista", title: "Virado à Paulista", desc: "Tutu, couve, linguiça e torresmo no prato." },
  { slug: "almondegas", title: "Almôndegas", desc: "Ao molho, macias e bem temperadas." },
  { slug: "peixe-grelhado", title: "Peixe Grelhado", desc: "Filé grelhado no ponto, leve e saboroso." },
  { slug: "omelete", title: "Omelete", desc: "Fofo por dentro, dourado por fora." },
  { slug: "panqueca", title: "Panqueca", desc: "Recheada e gratinada no molho." },
  { slug: "nhoque-ao-molho-branco", title: "Nhoque ao Molho Branco", desc: "Cremoso, com tirinhas de carne grelhada." },
  { slug: "canelone-ao-molho", title: "Canelone ao Molho", desc: "Recheado, gratinado no molho vermelho." },
  { slug: "feijoada", title: "Feijoada", desc: "Feijão preto, couve, farofa e carnes." },
];

const drinks = [
  { slug: "itubaina", title: "Itubaina", desc: "Refrigerante gelado para acompanhar." },
  { slug: "itubaina-zero", title: "Itubaina Zero", desc: "Sem açúcar, do jeito que você gosta." },
];

function DishCard({ slug, title, desc }) {
  return (
    <article className="marmitaria-card" data-marmitaria-card>
      <div className="marmitaria-card-photo">
        <picture>
          <source type="image/webp" srcSet={`/marmitaria/${slug}.webp`} />
          <img src={`/marmitaria/${slug}.png`} alt={title} width={300} height={300} loading="lazy" decoding="async" />
        </picture>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </article>
  );
}

export function MarmitariaPage() {
  const scopeRef = useGsap((gsap, el, ctx) => {
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      ctx.add(() => {
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          const groups = [el.querySelectorAll(".marmitaria-grid [data-marmitaria-card]"), el.querySelectorAll(".marmitaria-drinks [data-marmitaria-card]")];
          groups.forEach((cards) => {
            if (!cards.length) return;
            gsap.set(cards, { opacity: 0, y: 28, scale: 0.96 });
            ScrollTrigger.batch(cards, {
              start: "top 88%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.7,
                  ease: "power2.out",
                  stagger: 0.07,
                }),
            });
          });

          const hero = el.querySelector(".marmitaria-hero-copy");
          if (hero) {
            gsap.from(hero.children, {
              opacity: 0,
              y: 18,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.09,
            });
          }
        });

        return () => mm.revert();
      });
    });
  }, []);

  return (
    <main className="satellite-page marmitaria-page" ref={scopeRef}>
      <header className="menu-page-header">
        <a className="brand" href="/" aria-label="Voltar para a home do Varanda Ypê">
          <img src="/logo-icon-96.png" alt="" width={52} height={52} />
          <span>Varanda Ypê</span>
        </a>
        <a className="header-cta" href="/menu/">Cardápio</a>
        <a className="delivery-header-button" href={whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </header>

      <section className="satellite-hero">
        <div className="section-inner marmitaria-hero-copy">
          <nav className="breadcrumbs" aria-label="Navegação estrutural">
            <a href="/">Início</a>
            <span>›</span>
            <span>Marmitaria</span>
          </nav>
          <p className="section-label">Marmitaria</p>
          <h1>As opções da nossa marmitaria</h1>
          <p>
            Um panorama de tudo que já passou pela nossa cozinha, para você ter
            uma ideia do que esperar. As opções disponíveis variam dia a dia —
            fale com a gente para saber o cardápio de hoje.
          </p>
          <div className="hero-actions">
            <a
              className="button button-primary button-delivery-hot"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver cardápio de hoje no WhatsApp
            </a>
            <a className="button button-secondary" href="/delivery/marmitas/">
              Pedir pelo app
            </a>
          </div>
        </div>
      </section>

      <section className="marmitaria-section section-cream">
        <div className="section-inner">
          <div className="marmitaria-grid">
            {dishes.map((dish) => (
              <DishCard key={dish.slug} {...dish} />
            ))}
          </div>
        </div>
      </section>

      <section className="marmitaria-section marmitaria-drinks-section section-green">
        <div className="section-inner">
          <p className="section-label">Para acompanhar</p>
          <h2>Bebidas geladas</h2>
          <div className="marmitaria-grid marmitaria-drinks">
            {drinks.map((drink) => (
              <DishCard key={drink.slug} {...drink} />
            ))}
          </div>
        </div>
      </section>

      <section className="marmitaria-cta section-cream">
        <div className="section-inner marmitaria-cta-inner">
          <div>
            <p className="section-label">Pedir agora</p>
            <h2>Monte sua marmita de hoje</h2>
            <p>
              O cardápio muda dia a dia. Chame no WhatsApp para saber as opções
              disponíveis agora, ou acompanhe pelo app de delivery.
            </p>
          </div>
          <div className="hero-actions">
            <a className="button button-delivery-hot" href={whatsappUrl} target="_blank" rel="noreferrer">
              Falar no WhatsApp
            </a>
            <a className="button button-secondary-onlight" href="/delivery/marmitas/">
              Ver canais de delivery
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
