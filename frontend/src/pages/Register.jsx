import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("Sending registration data:", {
        name: formData.name,
        email: formData.email,
        location: formData.location,
      });

      const response = await API.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        location: formData.location.trim(),
      });

      console.log("Registration response:", response.data);

      // Save JWT token
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      // Save user
      if (response.data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      setMessage(
        response.data.message || "Registration successful!"
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        location: "",
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Registration Error:", error);

      if (error.response) {
        console.error(
          "Backend response:",
          error.response.data
        );

        setError(
          error.response.data?.message ||
            "Registration failed"
        );
      } else if (error.request) {
        setError(
          "Cannot connect to backend. Make sure the server is running on port 5000."
        );
      } else {
        setError(
          error.message || "Registration failed"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join the Clothing Exchange Marketplace
        </p>

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={6}
            required
          />

          {/* Location */}
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            autoComplete="address-level2"
          />

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

        </form>

        {/* Success message */}
        {message && (
          <p className="success-message">
            {message}
          </p>
        )}

        {/* Error message */}
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {/* Login */}
        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;