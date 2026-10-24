/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- legacy screen retained for reference; LiveApp owns current routing. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function MyListings() {
  const navigate = useNavigate();

  const [clothing, setClothing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyListings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await API.get("/clothing/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClothing(response.data.clothing || []);
    } catch (error) {
      console.error("My Listings Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load your listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  return (
    <div className="listings-page">

      <div className="listings-header">
        <div>
          <h1>My Listings</h1>

          <p>
            Manage the clothes you have added
            for exchange.
          </p>
        </div>

        <button
          className="add-listing-button"
          onClick={() => navigate("/add-clothing")}
        >
          + Add Clothing
        </button>
      </div>

      {loading && (
        <div className="listing-message">
          Loading your listings...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        clothing.length === 0 && (
          <div className="empty-listings">
            <div className="empty-icon">
              👕
            </div>

            <h2>No Listings Yet</h2>

            <p>
              You haven't added any clothes yet.
            </p>

            <button
              onClick={() =>
                navigate("/add-clothing")
              }
            >
              Add Your First Clothing
            </button>
          </div>
        )}

      {!loading &&
        clothing.length > 0 && (
          <div className="clothing-grid">

            {clothing.map((item) => (
              <div
                className="clothing-card"
                key={item._id}
              >

                <div className="clothing-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                    />
                  ) : (
                    <div className="no-image">
                      👕
                    </div>
                  )}

                  <span
                    className={`status-badge ${item.status
                      ?.toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {item.status}
                  </span>

                </div>

                <div className="clothing-content">

                  <h2>{item.title}</h2>

                  <p className="clothing-description">
                    {item.description}
                  </p>

                  <div className="clothing-details">

                    <span>
                      <strong>Category:</strong>{" "}
                      {item.category}
                    </span>

                    <span>
                      <strong>Type:</strong>{" "}
                      {item.type}
                    </span>

                    <span>
                      <strong>Size:</strong>{" "}
                      {item.size}
                    </span>

                    <span>
                      <strong>Condition:</strong>{" "}
                      {item.condition}
                    </span>

                    {item.brand && (
                      <span>
                        <strong>Brand:</strong>{" "}
                        {item.brand}
                      </span>
                    )}

                    {item.color && (
                      <span>
                        <strong>Color:</strong>{" "}
                        {item.color}
                      </span>
                    )}

                    {item.location && (
                      <span>
                        <strong>Location:</strong>{" "}
                        {item.location}
                      </span>
                    )}

                  </div>

                  <div className="clothing-card-footer">

                    <span>
                      Listed on{" "}
                      {new Date(
                        item.createdAt
                      ).toLocaleDateString()}
                    </span>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

    </div>
  );
}

export default MyListings;
