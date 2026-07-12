import React from "react";
import "../components/Services.css";

import designImg from "../assets/design.jpg";
import webImg from "../assets/webdev.jpg";
import cloudImg from "../assets/cloud.jpg";

const Services = () => {
  
  const services = [
    {
      title: "Testing & DevOps",
      img: designImg,
      targetId: "ui-design",
    },
    {
      title: "Web Development",
      img: webImg,
      targetId: "web-dev",
    },
    {
      title: "Cloud Migratin & Integration",
      img: cloudImg,
      targetId: "cloud",
    },
  ];

  const handleScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="services" id="services">
      
      <h2 className="section-title">Our Services</h2>
      <div className="service-grid">
        {services.map((s, i) => (
          <div
            key={i}
            className="service-card"
            onClick={() => handleScroll(s.targetId)}
            style={{ cursor: "pointer" }}
          >
            <img src={s.img} alt={s.title} className="service-img" />
            <div className="service-info">
              <h3>{s.title}</h3>
            </div>
          </div>
        ))}
        
      </div>
    </section>
  );
};

export default Services;

