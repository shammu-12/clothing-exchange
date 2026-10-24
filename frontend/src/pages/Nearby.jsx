/* eslint-disable react-hooks/set-state-in-effect -- legacy screen retained for reference; LiveApp owns current routing. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Nearby() {
  const navigate = useNavigate();

  const [clothing, setClothing] = useState([]);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClothing = async () => {
    try {
      const response = await API.get("/clothing");

      setClothing(response.data.clothing || []);
    } catch (error) {
      console.error("Nearby Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load clothing."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClothing();
  }, []);

  const nearbyClothing = clothing.filter((item) => {
    if (!location.trim()) {
      return true;
    }

    return item.location
      ?.toLowerCase()
      .includes(location.toLowerCase());
  });

  return (
    <div className="nearby-page">

      <div className="nearby-header">
        <div>
          <h1>Nearby Clothes</h1>

          <p>
            Find clothes available for exchange
            near your location.
          </p>
        </div>

        <button
          onClick={() => navigate("/browse")}
        >
          Browse All
        </button>
      </div>

      <div className="nearby-search">

        <input
          type="text"
          placeholder="Enter your city or location..."
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
        />

        <button
          onClick={() => setLocation("")}
        >
          Clear
        </button>

      </div>

      {loading && (
        <div className="listing-message">
          Loading nearby clothes...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        nearbyClothing.length === 0 && (
          <div className="empty-listings">

            <div className="empty-icon">
              📍
            </div>

            <h2>
              No Clothes Found
            </h2>

            <p>
              No clothing items were found
              in this location.
            </p>

          </div>
        )}

      {!loading &&
        nearbyClothing.length > 0 && (
          <div className="clothing-grid">

            {nearbyClothing.map((item) => (
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

                  <span className="status-badge">
                    {item.status}
                  </span>

                </div>

                <div className="clothing-content">

                  <h2>
                    {item.title}
                  </h2>

                  <p className="clothing-description">
                    {item.description}
                  </p>

                  <div className="clothing-details">

                    <span>
                      <strong>
                        Category:
                      </strong>{" "}
                      {item.category}
                    </span>

                    <span>
                      <strong>
                        Size:
                      </strong>{" "}
                      {item.size}
                    </span>

                    <span>
                      <strong>
                        Condition:
                      </strong>{" "}
                      {item.condition}
                    </span>

                    <span>
                      <strong>
                        Location:
                      </strong>{" "}
                      {item.location ||
                        "Not specified"}
                    </span>

                  </div>

                  <button
                    className="view-details-button"
                    onClick={() =>
                      navigate(
                        `/clothing/${item._id}`
                      )
                    }
                  >
                    View Details
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

    </div>
  );
}

export default Nearby;
