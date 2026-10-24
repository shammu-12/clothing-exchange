import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const user =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMenuOpen(false);

    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* =========================
          LOGO
      ========================= */}

      <Link
        to={token ? "/dashboard" : "/login"}
        className="navbar-logo"
        onClick={() => setMenuOpen(false)}
      >
        <span className="logo-icon">👕</span>
        <span>Clothing Exchange</span>
      </Link>


      {/* =========================
          MOBILE BUTTON
      ========================= */}

      <button
        className="menu-button"
        onClick={() =>
          setMenuOpen(!menuOpen)
        }
      >
        ☰
      </button>


      {/* =========================
          NAVIGATION
      ========================= */}

      <div
        className={`navbar-links ${
          menuOpen ? "active" : ""
        }`}
      >

        {token ? (
          <>
            <Link
              to="/dashboard"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Dashboard
            </Link>

            <Link
              to="/browse"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Browse
            </Link>

            <Link
              to="/nearby"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Nearby
            </Link>

            <Link
              to="/swap-requests"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Swap Requests
            </Link>

            <Link
              to="/my-listings"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              My Listings
            </Link>

            <Link
              to="/profile"
              className="profile-link"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              👤 {user.name || "Profile"}
            </Link>

            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Login
            </Link>

            <Link
              to="/register"
              className="register-nav-button"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              Register
            </Link>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;