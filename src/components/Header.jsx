
import React, { useState, useEffect } from "react";
import "../components/Header.css";
import logo from "../assets/ASVAAITLOGO.png";


const Header = () => {
  const companyName = "ASVAA IT Services & Solutions"; // Full correct name
  const [letters, setLetters] = useState([]);

  useEffect(() => {
    const chars = companyName.split(""); // Split into array
    let current = [];
    let index = 0;

    const interval = setInterval(() => {
      if (index < chars.length) {
        current.push(chars[index]);
        setLetters([...current]); // append next char
        index++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
                <img src={logo} alt="Logo" className="logo floating-logo" />
                <span className="company-name">
          
          {letters.map((char, idx) => (
            <span
              key={idx}
              style={{ animationDelay: `${idx * 0.1}s` }}
              className="letter"
            >
              {char}
            </span>
          ))}
        </span>
        
        <p className="tagline">Innovate. Integrate. Accelerate.</p>
      </div>

      <nav className="header-right">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        
      </nav>
    </header>
  );
};

export default Header;


