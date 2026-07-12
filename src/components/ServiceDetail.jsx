import React from "react";
import "../components/ServiceDetail.css";

const ServiceDetail = ({ id, title, description, img }) => {
  return (
    <section id={id} className="service-detail">
      <div className="detail-container">
        <img src={img} alt={title} className="detail-img" />
        <div className="detail-text">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;
