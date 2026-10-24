import { Link } from "react-router-dom";

function Footer() {
  const token = localStorage.getItem("token");

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}

        <div className="footer-brand">
          <h2>👕 Clothing Exchange</h2>

          <p>
            Give your clothes a second life.
            Exchange, discover and connect
            with people in your community.
          </p>
        </div>


        {/* Quick Links */}

        <div className="footer-section">
          <h3>Quick Links</h3>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/browse">
            Browse Clothes
          </Link>

          <Link to="/nearby">
            Nearby Clothes
          </Link>

          <Link to="/swap-requests">
            Swap Requests
          </Link>
        </div>


        {/* Account */}

        <div className="footer-section">
          <h3>Account</h3>

          {token ? (
            <>
              <Link to="/profile">
                My Profile
              </Link>

              <Link to="/my-listings">
                My Listings
              </Link>

              <Link to="/add-clothing">
                Add Clothing
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}
        </div>


        {/* About */}

        <div className="footer-section">
          <h3>Clothing Exchange</h3>

          <p>
            A community marketplace for
            exchanging pre-loved clothing.
          </p>

          <p>
            ♻️ Reuse • Exchange • Sustain
          </p>
        </div>

      </div>


      {/* Bottom */}

      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()}
          {" "}
          Clothing Exchange. All rights
          reserved.
        </p>

        <p>
          Made with ❤️ using React
        </p>

      </div>

    </footer>
  );
}

export default Footer;