/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability -- legacy screen retained for reference; LiveApp owns current routing. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Browse() {
  const navigate = useNavigate();

  const [clothing, setClothing] = useState([]);
  const [filteredClothing, setFilteredClothing] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClothing();
  }, []);

  const fetchClothing = async () => {
    try {
      const response = await API.get("/clothing");

      const items =
        response.data.clothing ||
        response.data.items ||
        response.data ||
        [];

      setClothing(items);
      setFilteredClothing(items);
    } catch (error) {
      console.error("Browse Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load clothing."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...clothing];

    if (search.trim()) {
      const searchText =
        search.toLowerCase().trim();

      result = result.filter((item) =>
        `${item.title || ""} ${
          item.description || ""
        }`
          .toLowerCase()
          .includes(searchText)
      );
    }

    if (category) {
      result = result.filter(
        (item) =>
          item.category?.toLowerCase() ===
          category.toLowerCase()
      );
    }

    if (size) {
      result = result.filter(
        (item) =>
          item.size?.toLowerCase() ===
          size.toLowerCase()
      );
    }

    if (condition) {
      result = result.filter(
        (item) =>
          item.condition?.toLowerCase() ===
          condition.toLowerCase()
      );
    }

    if (location.trim()) {
      result = result.filter((item) =>
        item.location
          ?.toLowerCase()
          .includes(location.toLowerCase().trim())
      );
    }

    setFilteredClothing(result);
  }, [
    search,
    category,
    size,
    condition,
    location,
    clothing,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setSize("");
    setCondition("");
    setLocation("");
  };

  return (
    <div className="browse-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="browse-header">

        <div>
          <h1>Browse Clothes</h1>

          <p>
            Discover clothes available for
            exchange.
          </p>
        </div>

        <button
          className="add-clothing-top-button"
          onClick={() =>
            navigate("/add-clothing")
          }
        >
          + Add Clothing
        </button>

      </div>


      {/* =========================
          FILTERS
      ========================= */}

      <div className="filter-box">

        <div className="search-wrapper">

          <label>
            Search
          </label>

          <input
            type="text"
            placeholder="Search clothes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <div className="filter-group">

          <label>
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="">
              All Categories
            </option>

            <option value="Men">
              Men
            </option>

            <option value="Women">
              Women
            </option>

            <option value="Kids">
              Kids
            </option>

            <option value="Shirts">
              Shirts
            </option>

            <option value="T-Shirts">
              T-Shirts
            </option>

            <option value="Dresses">
              Dresses
            </option>

            <option value="Pants">
              Pants
            </option>

            <option value="Jackets">
              Jackets
            </option>

            <option value="Sarees">
              Sarees
            </option>

          </select>

        </div>


        <div className="filter-group">

          <label>
            Size
          </label>

          <select
            value={size}
            onChange={(e) =>
              setSize(e.target.value)
            }
          >
            <option value="">
              All Sizes
            </option>

            <option value="XS">
              XS
            </option>

            <option value="S">
              S
            </option>

            <option value="M">
              M
            </option>

            <option value="L">
              L
            </option>

            <option value="XL">
              XL
            </option>

            <option value="XXL">
              XXL
            </option>

          </select>

        </div>


        <div className="filter-group">

          <label>
            Condition
          </label>

          <select
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value)
            }
          >
            <option value="">
              All Conditions
            </option>

            <option value="New">
              New
            </option>

            <option value="Like New">
              Like New
            </option>

            <option value="Good">
              Good
            </option>

            <option value="Fair">
              Fair
            </option>

          </select>

        </div>


        <div className="filter-group">

          <label>
            Location
          </label>

          <input
            type="text"
            placeholder="City / location"
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
          />

        </div>


        <button
          className="clear-filter-button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>


      {/* =========================
          RESULT COUNT
      ========================= */}

      {!loading && !error && (
        <div className="result-count">
          <strong>
            {filteredClothing.length}
          </strong>{" "}
          clothing item
          {filteredClothing.length !== 1
            ? "s"
            : ""}{" "}
          found
        </div>
      )}


      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="listing-message">
          Loading clothes...
        </div>
      )}


      {/* =========================
          ERROR
      ========================= */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* =========================
          NO RESULTS
      ========================= */}

      {!loading &&
        !error &&
        filteredClothing.length === 0 && (
          <div className="empty-listings">

            <div className="empty-icon">
              🔎
            </div>

            <h2>
              No Clothes Found
            </h2>

            <p>
              Try changing your search or
              filters.
            </p>

            <button
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        )}


      {/* =========================
          CLOTHING GRID
      ========================= */}

      {!loading &&
        !error &&
        filteredClothing.length > 0 && (
          <div className="browse-grid">

            {filteredClothing.map((item) => (
              <div
                className="browse-card"
                key={item._id}
              >

                <div className="browse-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={
                        item.title ||
                        "Clothing"
                      }
                    />
                  ) : (
                    <div className="browse-no-image">
                      👕
                    </div>
                  )}

                  <span className="browse-status">
                    {item.status ||
                      "Available"}
                  </span>

                </div>


                <div className="browse-content">

                  <h2>
                    {item.title ||
                      "Clothing Item"}
                  </h2>

                  <p className="browse-description">
                    {item.description ||
                      "No description available."}
                  </p>


                  <div className="browse-meta">

                    <span>
                      <strong>
                        Category:
                      </strong>{" "}
                      {item.category ||
                        "N/A"}
                    </span>

                    <span>
                      <strong>
                        Size:
                      </strong>{" "}
                      {item.size ||
                        "N/A"}
                    </span>

                    <span>
                      <strong>
                        Condition:
                      </strong>{" "}
                      {item.condition ||
                        "N/A"}
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

export default Browse;
