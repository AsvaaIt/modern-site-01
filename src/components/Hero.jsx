import React from "react";
import "../components/Hero.css";

import heroDesktop from "../assets/hero-desktop.png";
import heroMobile from "../assets/hero-mobile.png";

const Hero = () => {
  const handleExplore = () => {
    const element = document.getElementById("services");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <section className="hero">
      <picture className="hero-picture">
        <source
          media="(max-width:768px)"
          srcSet={heroMobile}
        />

        <img
          src={heroDesktop}
          alt="Web Hosting"
          className="hero-image"
        />
      </picture>

      <button className="explore-btn" onClick={handleExplore}>
        Explore Now
      </button>
    </section>
  );
};

export default Hero;