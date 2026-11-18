// src/comp/Navbar.jsx
import React from "react";
import { IoMoon } from "react-icons/io5";
import { LuSun } from "react-icons/lu";
import { Link } from "react-router-dom";

const Navbar = ({ colorMode, toggleColorMode, theme }) => (
  <nav className="store-header"
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "18px clamp(16px, 4vw, 36px)",
      background: theme.navbarBg,
      color: theme.navbarText,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      transition: "background 0.3s, color 0.3s",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}
  >
    <Link
      to="/"
      style={{
        fontWeight: "bold",
        fontSize: "clamp(18px, 4vw, 28px)",
        textDecoration: "none",
        color: theme.navbarText,
        letterSpacing: 1,
      }}
    >
      <img src="/shopsphere.svg" width="34" height="34" alt="" style={{display:"inline-block",verticalAlign:"middle",marginRight:10}} />ShopSphere
    </Link>
    <div style={{ display: "flex", gap: 16 }}>
      <Link to="/create">
        <button
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: theme.buttonBg,
            color: theme.buttonText,
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: 16,
            transition: "background 0.2s",
          }}
        >
          + Create
        </button>
      </Link>
      <button aria-label="Toggle colour theme"
        onClick={toggleColorMode}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 24,
          color: theme.navbarText,
        }}
        title="Toggle color mode"
      >
        {colorMode === "light" ? <IoMoon /> : <LuSun />}
      </button>
    </div>
  </nav>
);

export default Navbar;
