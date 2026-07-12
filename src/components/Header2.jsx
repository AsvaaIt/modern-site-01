import React from "react";
import logo from "../assets/ASVAAITLOGO.png";
import "../components/Header.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo-section">
        <img src={logo} alt="Logo" className="logo" />
        <h1 className="site-name">ASVAA IT Solutions</h1>
      </div>
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#services">Services</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  );
};

export default Header;
