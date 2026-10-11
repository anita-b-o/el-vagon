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
          {frequentlyAskedQuestions.map((category) => (
            <details className="faq-category" key={category.id}>
              <summary>
                <span className="faq-category-title">{category.title}</span>
                <span className="faq-indicator" aria-hidden="true" />
              </summary>
              <div className="faq-questions">
                {category.questions.map((item) => (
                  <details className="faq-item" key={item.id}>
                    <summary>
                      <span className="faq-question">{item.question}</span>
                      <span className="faq-question-indicator" aria-hidden="true" />
                    </summary>
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
