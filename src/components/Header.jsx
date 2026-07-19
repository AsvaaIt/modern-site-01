import React, { useState, useEffect } from "react";
import "./Header.css";
import logo from "../assets/ASVAAITLOGO.png";

const Header = () => {
  const companyName = "ASVAA IT Services & Solutions";

  const [letters, setLetters] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const chars = companyName.split("");
    let current = [];
    let index = 0;

    const interval = setInterval(() => {
      if (index < chars.length) {
        current.push(chars[index]);
        setLetters([...current]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 70);

    return () => clearInterval(interval);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-left">
        <img
          src={logo}
          alt="ASVAA IT Logo"
          className="logo floating-logo"
        />

        <div>
          <h2 className="company-name">
            {letters.map((char, idx) => (
              <span
                key={idx}
                className="letter"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {char}
              </span>
            ))}
          </h2>

          <p className="tagline">
            Innovate. Integrate. Accelerate.
          </p>
        </div>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <nav className={`header-right ${menuOpen ? "active" : ""}`}>
        <a href="#home" onClick={closeMenu}>Home</a>
        <a href="#services" onClick={closeMenu}>Services</a>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#contact" onClick={closeMenu}>Contact</a>
      </nav>
    </header>
  );
};

export default Header;

