import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem("user")
    ) || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="dashboard-page">

      {/* Header */}

      <div className="dashboard-header">

        <div>
          <h1>
            Welcome, {user.name || "User"} 👋
          </h1>

          <p>
            Welcome to Clothing Exchange
          </p>
        </div>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>


      {/* Dashboard Cards */}

      <div className="dashboard-grid">

        {/* Profile */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/profile")
          }
        >
          <div className="dashboard-icon">
            👤
          </div>

          <h2>My Profile</h2>

          <p>
            View your account information.
          </p>

          <button>
            View Profile
          </button>
        </div>


        {/* Add Clothing */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/add-clothing")
          }
        >
          <div className="dashboard-icon">
            ➕
          </div>

          <h2>Add Clothing</h2>

          <p>
            List clothes you want to exchange.
          </p>

          <button>
            Add Item
          </button>
        </div>


        {/* My Listings */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/my-listings")
          }
        >
          <div className="dashboard-icon">
            👕
          </div>

          <h2>My Listings</h2>

          <p>
            Manage your listed clothing.
          </p>

          <button>
            My Listings
          </button>
        </div>


        {/* Browse */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/browse")
          }
        >
          <div className="dashboard-icon">
            🔎
          </div>

          <h2>Browse Clothes</h2>

          <p>
            Explore clothes from other users.
          </p>

          <button>
            Browse
          </button>
        </div>


        {/* Nearby */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/nearby")
          }
        >
          <div className="dashboard-icon">
            📍
          </div>

          <h2>Nearby Clothes</h2>

          <p>
            Find clothes near your location.
          </p>

          <button>
            Find Nearby
          </button>
        </div>


        {/* Swap Requests */}

        <div
          className="dashboard-card"
          onClick={() =>
            navigate("/swap-requests")
          }
        >
          <div className="dashboard-icon">
            🔄
          </div>

          <h2>Swap Requests</h2>

          <p>
            Manage your clothing exchange
            requests.
          </p>

          <button>
            View Requests
          </button>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;