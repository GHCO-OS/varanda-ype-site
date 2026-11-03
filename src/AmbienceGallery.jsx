import React, { useEffect, useRef, useState } from "react";
import "./ambience-gallery.css";

const photos = [
  { file: "vista-ampla-salao-varanda-ype", title: "Um salão para reunir a família", caption: "Mesas amplas, área coberta e espaço kids ao fundo.", width: 1280, height: 960 },
  { file: "salao-mesas-interior-varanda-ype", title: "Aconchego em cada mesa", caption: "Conheça o restaurante por dentro, com suas mesas e iluminação acolhedora.", width: 960, height: 1280 },
  { file: "rampa-salao-espaco-kids-varanda-ype", title: "Ambientes conectados", caption: "Rampa de acesso e espaço kids próximo ao salão.", width: 1280, height: 960 },
  { file: "brinquedao-espaco-kids-varanda-ype", title: "Um cantinho para brincar", caption: "O brinquedão fica ao lado das mesas, à vista dos familiares.", width: 1280, height: 960 },
  { file: "drinks-bar-smirnoff-varanda-ype-campinas", title: "Chopp, drinks e boteco", caption: "Bar completo com drinks gelados para acompanhar a mesa.", width: 960, height: 1280 },
];

export function AmbienceGallery() {
  const track = useRef(null);
  const dialog = useRef(null);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (selected === null) return;
    if (!dialog.current.open) dialog.current.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [selected]);

  function move(index) {
    const container = track.current;
    const slide = container.children[index];
    container.scrollTo({ left: slide.offsetLeft - container.children[0].offsetLeft, behavior: "instant" });
  }

  return (
    <div className="restaurant-gallery" role="region" aria-label="Fotos do restaurante">
      <div className="restaurant-gallery-toolbar">
        <p>Conheça o Varanda por dentro</p>
        <div className="restaurant-gallery-controls">
          <span aria-live="polite">{active + 1} / {photos.length}</span>
          <button type="button" title="Foto anterior" aria-label="Foto anterior" disabled={active === 0} onClick={() => move(active - 1)}>←</button>
          <button type="button" title="Próxima foto" aria-label="Próxima foto" disabled={active === photos.length - 1} onClick={() => move(active + 1)}>→</button>
        </div>
      </div>
      <div className="restaurant-gallery-track" ref={track} onScroll={() => {
        const container = track.current;
        const position = container.getBoundingClientRect().left;
        const distances = [...container.children].map((child) => Math.abs(child.getBoundingClientRect().left - position));
        setActive(distances.indexOf(Math.min(...distances)));
      }}>
        {photos.map((photo, index) => (
          <figure key={photo.file} className="restaurant-gallery-slide">
            <button type="button" className="restaurant-gallery-photo" aria-label={`Ampliar foto: ${photo.title}`} onClick={() => setSelected(index)}>
              <img src={`/ambiente/${photo.file}.jpg`} alt={`${photo.title} — interior do Varanda Ypê em Campinas`} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
              <span aria-hidden="true">⤢</span>
            </button>
            <figcaption><h3>{photo.title}</h3><p>{photo.caption}</p></figcaption>
          </figure>
        ))}
      </div>
      <dialog ref={dialog} className="restaurant-gallery-dialog" aria-label="Foto ampliada do restaurante" onClose={() => setSelected(null)} onClick={(event) => { if (event.target === dialog.current) dialog.current.close(); }} onKeyDown={(event) => {
        if (event.key === "ArrowRight") { event.preventDefault(); setSelected((selected + 1) % photos.length); }
        if (event.key === "ArrowLeft") { event.preventDefault(); setSelected((selected + photos.length - 1) % photos.length); }
      }}>
        {selected !== null && <>
          <div className="restaurant-gallery-modalbar">
            <span>{selected + 1} / {photos.length}</span>
            <button type="button" aria-label="Fechar foto ampliada" title="Fechar" onClick={() => dialog.current.close()}>×</button>
          </div>
          <img src={`/ambiente/${photos[selected].file}.jpg`} alt={photos[selected].caption} width={photos[selected].width} height={photos[selected].height} />
          <div className="restaurant-gallery-modalfooter">
            <button type="button" aria-label="Foto anterior ampliada" title="Foto anterior" onClick={() => setSelected((selected + photos.length - 1) % photos.length)}>←</button>
            <p>{photos[selected].caption}</p>
            <button type="button" aria-label="Próxima foto ampliada" title="Próxima foto" onClick={() => setSelected((selected + 1) % photos.length)}>→</button>
          </div>
        </>}
      </dialog>
    </div>
  );
}
