import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AddClothing() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    size: "",
    condition: "",
    brand: "",
    color: "",
    location: "",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login before adding clothing.");
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await API.post(
        "/clothing",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message ||
          "Clothing item added successfully!"
      );

      setFormData({
        title: "",
        description: "",
        category: "",
        type: "",
        size: "",
        condition: "",
        brand: "",
        color: "",
        location: "",
        image: "",
      });

      setTimeout(() => {
        navigate("/my-listings");
      }, 1200);
    } catch (error) {
      console.error("Add Clothing Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to add clothing item."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-clothing-page">
      <div className="add-clothing-card">

        <div className="add-clothing-header">
          <h1>Add Clothing</h1>

          <p>
            List your clothes and find someone
            interested in exchanging them.
          </p>
        </div>

        <form
          className="clothing-form"
          onSubmit={handleSubmit}
        >

          {/* Title */}
          <div className="form-group">
            <label>Clothing Title *</label>

            <input
              type="text"
              name="title"
              placeholder="Example: Blue Denim Jacket"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description *</label>

            <textarea
              name="description"
              placeholder="Describe the clothing item..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          {/* Category */}
          <div className="form-row">

            <div className="form-group">
              <label>Category *</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Category
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

                <option value="Unisex">
                  Unisex
                </option>
              </select>
            </div>

            {/* Type */}
            <div className="form-group">
              <label>Clothing Type *</label>

              <input
                type="text"
                name="type"
                placeholder="T-Shirt, Jeans, Jacket..."
                value={formData.type}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          {/* Size + Condition */}
          <div className="form-row">

            <div className="form-group">
              <label>Size *</label>

              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Size
                </option>

                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div className="form-group">
              <label>Condition *</label>

              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select Condition
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

                <option value="Used">
                  Used
                </option>
              </select>
            </div>

          </div>

          {/* Brand + Color */}
          <div className="form-row">

            <div className="form-group">
              <label>Brand</label>

              <input
                type="text"
                name="brand"
                placeholder="Example: Levi's"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Color</label>

              <input
                type="text"
                name="color"
                placeholder="Example: Blue"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

          </div>

          {/* Location */}
          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              name="location"
              placeholder="Example: Eluru"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          {/* Image URL */}
          <div className="form-group">
            <label>Image URL</label>

            <input
              type="url"
              name="image"
              placeholder="https://example.com/image.jpg"
              value={formData.image}
              onChange={handleChange}
            />

            <small>
              You can add an image URL for now.
            </small>
          </div>

          {/* Messages */}
          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="form-actions">

            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading
                ? "Adding..."
                : "Add Clothing"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AddClothing;