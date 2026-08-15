import Image from "next/image";

export function Experience() {
  return (
    <section id="experiencia" className="experience-section" aria-labelledby="experience-title">
      <div className="experience-image">
        <Image
          src="/images/el-vagon/pileta-atardecer.webp"
          alt="Pileta y jardín de El Vagón iluminados por el sol de la tarde"
          fill
          sizes="100vw"
        />
      </div>
      <div className="experience-overlay" />
      <div className="container experience-content reveal">
        <p className="eyebrow eyebrow-light">La experiencia</p>
        <h2 id="experience-title">Hay días que piden ir más despacio</h2>
        <p>
          Despertarse sin apuro. Tomar algo afuera. Escuchar el jardín. Salir a recorrer
          General Belgrano y volver sabiendo que todavía queda tiempo para descansar.
        </p>
      </div>
      <p className="experience-side-note" aria-hidden="true">
        El Vagón · General Belgrano
      </p>
    </section>
  );
}

