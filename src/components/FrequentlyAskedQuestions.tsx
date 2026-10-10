import { frequentlyAskedQuestions } from "@/data/site";

export function FrequentlyAskedQuestions() {
  return (
    <section
      id="preguntas-frecuentes"
      className="faq-section section"
      aria-labelledby="faq-title"
    >
      <div className="container faq-layout">
        <div className="faq-heading reveal">
          <p className="eyebrow">Antes de venir</p>
          <h2 id="faq-title">Preguntas frecuentes</h2>
          <p>
            Todo lo que necesitás saber antes de disfrutar tu estadía en El Vagón.
          </p>
        </div>

        <div className="faq-list reveal">
          {frequentlyAskedQuestions.map((item, index) => (
            <details className="faq-item" key={item.question}>
              <summary>
                <span className="faq-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-question">{item.question}</span>
                <span className="faq-indicator" aria-hidden="true" />
              </summary>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
