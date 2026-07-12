
import React from "react";
import "../components/Hero.css";
import heroBg from "/src/hero-bg.jpg";

const Hero = () => {
  const handleExplore = () => {
    const element = document.getElementById("services");
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <button className="explore-btn" onClick={handleExplore}>
        Explore Now
      </button>
    </section>
  );
};

export default Hero;
