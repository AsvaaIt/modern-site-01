import "../components/About.css";
import React, { useEffect, useState } from "react";

const About = () => {
  const title = "About Us";
  const paragraphs = [
    "At ASVAA IT Solutions, we specialize in delivering next-generation technology services that empower businesses to scale with confidence. Our core expertise spans across Testing Services, DevOps Solutions, and Cloud Infrastructure & Migration. We help enterprises build reliable and efficient software through our advanced Testing and Quality Assurance frameworks. Our DevOps experts streamline your entire development lifecycle — from continuous integration and deployment (CI/CD) to automation and monitoring — ensuring faster releases and stable environments. On the cloud front, we enable organizations to migrate and manage their      infrastructure securely on leading platforms like AWS, Azure, and Google Cloud. From architecture design to deployment and optimization, our Cloud Integration and Migration Services ensure maximum scalability, performance, and cost efficiency. With a focus on innovation, reliability, and client success, ASVAA IT Solutions transforms IT operations into a robust digital foundation for modern enterprises..",
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
