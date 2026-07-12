import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Services from "./components/Services.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";
import ServiceDetail from "./components/ServiceDetail";
import Contact from "./components/Contact.jsx";
import designDetail from "./assets/design-detail.jpg";
import webdevDetail from "./assets/webdev-detail.jpg";
import cloudDetail from "./assets/cloud-detail.jpg";
import { useEffect } from "react";
import { io } from "socket.io-client";



function App() {
  useEffect(() => {
    const socket = io("http://localhost:3000");

    // Emit visitor info on page load
    socket.emit("new-visitor", {
      ip: "auto-detected or from backend",
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    return () => socket.disconnect(); // cleanup
  }, []);
  return (
    <>
      <Header />
      <Hero />
       <About />
      <Services />

      <ServiceDetail
        id="ui-design"
        title="Testing & DevOps"
        description="At ASVAA IT Solutions, we deliver robust software testing and streamlined DevOps practices to ensure high-quality, reliable applications. Our testing services include manual and automated testing, performance optimization, and continuous integration/continuous deployment (CI/CD) pipelines. By integrating DevOps, we accelerate development cycles, reduce deployment risks, and maintain consistent environments, helping businesses release software faster, smarter, and more efficiently.."
        img={designDetail}
      />
      <ServiceDetail
        id="web-dev"
        title="Web Development"
        description="At ASVAA IT Solutions, we specialize in creating responsive, high-performance web applications that drive business growth. Our team leverages the latest technologies, including React, Node.js, and modern frameworks, to build scalable, secure, and user-friendly websites. From custom web development to e-commerce platforms and progressive web apps, we ensure seamless performance, intuitive design, and optimized user experiences across all devices.."
        img={webdevDetail}
      />
      <ServiceDetail
        id="cloud"
        title="Cloud Migration & Integration"
        description="At ASVAA IT Solutions, we help businesses seamlessly migrate and integrate their applications and data to the cloud. Our services include cloud strategy planning, deployment, and ongoing management to ensure secure, scalable, and cost-effective solutions. By leveraging leading cloud platforms, we enable organizations to improve agility, enhance collaboration, and accelerate innovation while minimizing downtime and operational risks.."
        img={cloudDetail}
      />
     
      <section id="contact">
        <Contact />
      </section>
      <Footer />
       
    </>
  );
}

export default App;


