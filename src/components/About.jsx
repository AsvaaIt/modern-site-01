import "../components/About.css";
import React, { useEffect, useState } from "react";

const About = () => {
  const title = "About Us";
  const paragraphs = [
    "At ASVAA IT Solutions, we deliver next-generation technology services that empower businesses to scale with confidence. Our core expertise spans application and product development, comprehensive software testing, robust IT infrastructure, and cutting-edge Artificial Intelligence (AI) integration. We help enterprises build intelligent, future-ready applications by embedding modern AI capabilities—from predictive analytics to generative AI models—directly into their digital ecosystems. By leveraging advanced DevOps practices, including AI-driven automation and continuous integration and deployment (CI/CD), we ensure faster release cycles and rock-solid environments. From initial architecture design through deployment and ongoing optimization, our solutions are engineered for maximum scalability, performance, and cost-efficiency. Driven by a commitment to innovation and client success, ASVAA IT Solutions transforms complex IT operations into a smart, secure digital foundation...",
  ];

  const [typedTitle, setTypedTitle] = useState("");
  const [typedParagraphs, setTypedParagraphs] = useState(["", ""]);

  useEffect(() => {
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      if (titleIndex < title.length) {
        setTypedTitle(title.substring(0, titleIndex + 1));
        titleIndex++;
      } else {
        clearInterval(titleInterval);
        startTypingParagraphs();
      }
    }, 150); // speed for title typing

    const startTypingParagraphs = () => {
      let pIndex = 0;
      let charIndex = 0;

      const paragraphInterval = setInterval(() => {
        if (pIndex < paragraphs.length) {
          if (charIndex < paragraphs[pIndex].length) {
            setTypedParagraphs(prev => {
              const newParagraphs = [...prev];
              newParagraphs[pIndex] = paragraphs[pIndex].substring(0, charIndex + 1);
              return newParagraphs;
            });
            charIndex++;
          } else {
            pIndex++;
            charIndex = 0;
          }
        } else {
          clearInterval(paragraphInterval);
        }
      }, 20); // speed per character in paragraph
    };

    return () => clearInterval(titleInterval);
  }, []);

  return (
    <section className="about" id="about">
      <h2 className="typing-title">{typedTitle}</h2>
      {typedParagraphs.map((p, i) => (
        <p key={i} className="typing-paragraph">{p}</p>
      ))}
    </section>
  );
};

export default About;
