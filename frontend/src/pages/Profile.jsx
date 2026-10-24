/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps -- legacy screen retained for reference; LiveApp owns current routing. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get(
        "/auth/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(
        response.data.user || response.data
      );
    } catch (error) {
      console.error(
        "Profile Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");
  };

  if (loading) {
    return (
      <div className="details-message">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-message">
        <p className="error-message">
          {error}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* Profile Header */}

        <div className="profile-header">

          <div className="profile-avatar">
            {user?.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U"}
          </div>

          <div>
            <h1>
              {user?.name || "User"}
            </h1>

            <p>
              Clothing Exchange Member
            </p>
          </div>

        </div>


        {/* User Information */}

        <div className="profile-info">

          <div className="profile-info-item">
            <span>Name</span>

            <strong>
              {user?.name || "Not available"}
            </strong>
          </div>

          <div className="profile-info-item">
            <span>Email</span>

            <strong>
              {user?.email || "Not available"}
            </strong>
          </div>

          <div className="profile-info-item">
            <span>Location</span>

            <strong>
              {user?.location ||
                "Not specified"}
            </strong>
          </div>

        </div>


        {/* Actions */}

        <div className="profile-actions">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="dashboard-button"
          >
            Back to Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/my-listings")
            }
            className="listings-button"
          >
            My Listings
          </button>

          <button
            onClick={() =>
              navigate("/swap-requests")
            }
            className="requests-button"
          >
            Swap Requests
          </button>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;
