import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/authContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for menu toggle

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const isLoggedIn = user || localStorage.getItem("token");

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsMenuOpen(false); // Close menu on logout
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Always display the CodeArena logo */}
        <Link to="/" className="logo">
          Code<span className="highlight">Arena</span>
        </Link>

        {/* Display other navigation links only if not on login/signup page */}
        {!isAuthPage && (
          <>
            {/* Hamburger icon */}
            <button
              className={`hamburger ${isMenuOpen ? "active" : ""}`}
              onClick={toggleMenu}
            >
              <span className="bar"></span>
              <span className="bar"></span>
              <span className="bar"></span>
            </button>

            {/* Navigation links */}
            <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
              <li>
                <Link to="/" onClick={() => setIsMenuOpen(false)}>
                  Home
                </Link>
              </li>
              {isLoggedIn && (
                <>
                  <li>
                    <Link
                      to="/problemtable"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Problems
                    </Link>
                  </li>
                  <li>
                    <Link to="/rankings" onClick={() => setIsMenuOpen(false)}>
                      Rankings
                    </Link>
                  </li>
                  <li>
                    <Link to="/home" onClick={() => setIsMenuOpen(false)}>
                      Collab
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="logout-btn nav-btn"
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
              {!isLoggedIn && (
                <li>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
