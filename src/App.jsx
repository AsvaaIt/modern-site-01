import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Services from "./components/Services.jsx";
import About from "./components/About.jsx";
import Footer from "./components/Footer.jsx";
import ServiceDetail from "./components/ServiceDetail";
import Contact from "./components/Contact.jsx";
import Chatbot from "./components/Chatbot.jsx"; // <-- Added Chatbot Import
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

  return (
    <>
      <Header />
      <Hero />
      <About />
      <Services />

      <ServiceDetail
        id="ui-design"
        title="Application Development & Testing"
        description="At ASVAA IT Solutions, we deliver robust software testing and streamlined DevOps practices to ensure high-quality, reliable applications. Our testing services include manual and automated testing, performance optimization, and continuous integration/continuous deployment (CI/CD) pipelines. By integrating DevOps, we accelerate development cycles, reduce deployment risks, and maintain consistent environments, helping businesses release software faster, smarter, and more efficiently.."
        img={designDetail}
      />
      <ServiceDetail
        id="web-dev"
        title="Project Management"
        description="At ASVAA IT, our AI-driven project management methodology utilizes an integrated framework that combines human intellect, precise data, and interconnected systems to execute complex projects flawlessly. By treating project management as a holistic ecosystem rather than a checklist of isolated tasks, we synchronize eight core pillars of success: maintaining transparent communication, strictly defining project scope, engineering precise timelines, enforcing rigorous cost controls, and orchestrating highly skilled human resources. Furthermore, this comprehensive approach ensures continuous quality verification, proactive risk mitigation, and strategic procurement partnerships. The true power of our methodology lies in its interconnected intelligence; because we recognize that a shift in one area immediately impacts others, our central AI-driven approach allows us to proactively adapt, protect quality, and build a highly resilient framework to drive your project to successful completion..."
        img={webdevDetail}
      />
      <ServiceDetail
        id="cloud"
        title="IT infrastructure Support and Services"
        description="At ASVAA IT, we maximize your hardware investments and ensure continuous uptime with our comprehensive IT infrastructure services, designed to provide a resilient and secure digital foundation for your business. We specialize in advanced virtualization and server management, handling everything from dynamic resource allocation to seamless, zero-disruption upgrades for complex multi-node clusters. To keep your operations online, we engineer high-availability architectures with strategic failover protocols and automated disaster recovery plans that safeguard your data against hardware failures and cyber threats. Beneath the application layer, our 24/7 proactive monitoring and enterprise-grade security protocols—including advanced firewalls and network isolation—protect your digital assets around the clock. Whether your environment is on-premises, fully cloud-based, or hybrid, we manage seamless migrations and load balancing to guarantee peak performance. All of this is backed by our proactive IT helpdesk, which operates as an extension of your team to provide rapid troubleshooting, automated patching, and continuous maintenance, resolving bottlenecks behind the scenes for a completely frictionless end-user experience..."
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