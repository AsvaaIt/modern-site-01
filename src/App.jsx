import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Services from "./components/Services.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";
import ServiceDetail from "./components/ServiceDetail";
import Contact from "./components/Contact.jsx";
import Chatbot from "./components/Chatbot.jsx";
import Portal from "./components/Portal.jsx"; // <-- 1. Import your new Portal component
import designDetail from "./assets/design-detail.png";
import webdevDetail from "./assets/projdev-detail.png";
import cloudDetail from "./assets/cloud-detail.png";
import { useEffect } from "react";
import { io } from "socket.io-client";

function App() {
  useEffect(() => {
    const socket = io();

    // Emit visitor info on page load
    socket.emit("new-visitor", {
      ip: "auto-detected or from backend",
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    return () => socket.disconnect(); // cleanup
  }, []);

  // 2. Simple Routing: Check the URL path
  const currentPath = window.location.pathname;

  // If the user goes to /portal, ONLY render the Portal component
  if (currentPath === "/portal") {
    return <Portal />;
  }

  // Otherwise, render your normal main website
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Services />

      <ServiceDetail
        id="ui-design"
        title="Application Development & Testing"
        description="At ASVAA IT Solutions, we deliver robust software testing and streamlined DevOps practices to ensure high-quality, reliable applications..."
        img={designDetail}
      />
      <ServiceDetail
        id="web-dev"
        title="Project Management"
        description="At ASVAA IT, our AI-driven project management methodology utilizes an integrated framework..."
        img={webdevDetail}
      />
      <ServiceDetail
        id="cloud"
        title="IT infrastructure Support and Services"
        description="At ASVAA IT, we maximize your hardware investments and ensure continuous uptime with our comprehensive IT infrastructure services..."
        img={cloudDetail}
      />
      
      <section id="contact">
        <Contact />
      </section>
      <Footer />
      
      {/* Floating Chatbot Component */}
      <Chatbot />
    </>
  );
}

export default App;