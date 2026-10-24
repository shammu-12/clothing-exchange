/* eslint-disable react-hooks/immutability, react-hooks/exhaustive-deps -- legacy screen retained for reference; LiveApp owns current routing. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function SwapRequests() {
  const navigate = useNavigate();

  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [sentResponse, receivedResponse] =
        await Promise.all([
          API.get("/swaps/sent", config),
          API.get("/swaps/received", config),
        ]);

      setSentRequests(
        sentResponse.data.requests || []
      );

      setReceivedRequests(
        receivedResponse.data.requests || []
      );
    } catch (error) {
      console.error(
        "Swap Requests Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load swap requests."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (
    requestId,
    status
  ) => {
    try {
      setUpdatingId(requestId);

      await API.put(
        `/swaps/${requestId}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchRequests();
    } catch (error) {
      console.error(
        "Update Request Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to update request."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="details-message">
        Loading swap requests...
      </div>
    );
  }

  return (
    <div className="swap-requests-page">

      {/* Header */}
      <div className="swap-page-header">

        <div>
          <h1>Swap Requests</h1>

          <p>
            Manage your clothing exchange
            requests.
          </p>
        </div>

        <button
          onClick={() => navigate("/browse")}
        >
          Browse Clothes
        </button>

      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* =========================
          RECEIVED REQUESTS
      ========================= */}

      <section className="requests-section">

        <div className="section-heading">
          <h2>
            Received Requests
          </h2>

          <span>
            {receivedRequests.length}
          </span>
        </div>

        {receivedRequests.length === 0 ? (
          <div className="no-requests">
            <div>📭</div>

            <h3>
              No received requests
            </h3>

            <p>
              Requests from other users will
              appear here.
            </p>
          </div>
        ) : (
          <div className="requests-grid">

            {receivedRequests.map(
              (request) => (
                <div
                  className="request-card"
                  key={request._id}
                >

                  <div className="request-image">

                    {request.clothing?.image ? (
                      <img
                        src={
                          request.clothing.image
                        }
                        alt={
                          request.clothing.title
                        }
                      />
                    ) : (
                      <div className="request-no-image">
                        👕
                      </div>
                    )}

                  </div>

                  <div className="request-content">

                    <span
                      className={`request-status ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>

                    <h3>
                      {request.clothing?.title ||
                        "Clothing item"}
                    </h3>

                    <p>
                      <strong>
                        Requested by:
                      </strong>{" "}
                      {request.requester?.name ||
                        "Unknown user"}
                    </p>

                    {request.requester
                      ?.location && (
                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {
                          request.requester
                            .location
                        }
                      </p>
                    )}

                    {request.message && (
                      <div className="request-message">
                        <strong>
                          Message:
                        </strong>

                        <p>
                          {request.message}
                        </p>
                      </div>
                    )}

                    {request.status ===
                      "Pending" && (
                      <div className="request-actions">

                        <button
                          className="accept-button"
                          disabled={
                            updatingId ===
                            request._id
                          }
                          onClick={() =>
                            updateRequest(
                              request._id,
                              "Accepted"
                            )
                          }
                        >
                          {updatingId ===
                          request._id
                            ? "Updating..."
                            : "Accept"}
                        </button>

                        <button
                          className="reject-button"
                          disabled={
                            updatingId ===
                            request._id
                          }
                          onClick={() =>
                            updateRequest(
                              request._id,
                              "Rejected"
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>
                    )}

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>


      {/* =========================
          SENT REQUESTS
      ========================= */}

      <section className="requests-section">

        <div className="section-heading">
          <h2>
            My Sent Requests
          </h2>

          <span>
            {sentRequests.length}
          </span>
        </div>

        {sentRequests.length === 0 ? (
          <div className="no-requests">
            <div>📤</div>

            <h3>
              No sent requests
            </h3>

            <p>
              Your swap requests will appear
              here.
            </p>
          </div>
        ) : (
          <div className="requests-grid">

            {sentRequests.map(
              (request) => (
                <div
                  className="request-card"
                  key={request._id}
                >

                  <div className="request-image">

                    {request.clothing?.image ? (
                      <img
                        src={
                          request.clothing.image
                        }
                        alt={
                          request.clothing.title
                        }
                      />
                    ) : (
                      <div className="request-no-image">
                        👕
                      </div>
                    )}

                  </div>

                  <div className="request-content">

                    <span
                      className={`request-status ${request.status.toLowerCase()}`}
                    >
                      {request.status}
                    </span>

                    <h3>
                      {request.clothing?.title ||
                        "Clothing item"}
                    </h3>

                    <p>
                      <strong>
                        Owner:
                      </strong>{" "}
                      {request.owner?.name ||
                        "Unknown user"}
                    </p>

                    {request.owner?.location && (
                      <p>
                        <strong>
                          Location:
                        </strong>{" "}
                        {request.owner.location}
                      </p>
                    )}

                    {request.message && (
                      <div className="request-message">
                        <strong>
                          Your message:
                        </strong>

                        <p>
                          {request.message}
                        </p>
                      </div>
                    )}

                    <p className="request-date">
                      Requested on{" "}
                      {new Date(
                        request.createdAt
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

    </div>
  );
}

export default SwapRequests;
