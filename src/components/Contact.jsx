import "../components/Contact.css";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await fetch(
                         "/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus(data.message || "✅ Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          message: "",
        });
      } else {
        setStatus(
          `❌ ${data.error || data.message || "Something went wrong"}`
        );
      }
    } catch (err) {
      console.error("Contact form error:", err);
      setStatus("❌ Error sending message. Please try again later.");
    }
  };

  return (
    <section id="contact" className="contact-section">
      <h2>Contact Us</h2>
      <p>Fill out the form or reach us at info@asvaa-it.in</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        />

        <button type="submit">Send</button>
      </form>

      {status && (
        <p style={{ marginTop: "15px", textAlign: "center" }}>
          {status}
        </p>
      )}
    </section>
  );
}