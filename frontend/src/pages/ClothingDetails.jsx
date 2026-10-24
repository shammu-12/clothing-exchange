import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";

export default function ClothingDetails() {
  const { id } = useParams();
  const [clothing, setClothing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    API.get(`/clothing/${id}`)
      .then(({ data }) => setClothing(data.clothing))
      .catch((err) => setError(err.response?.data?.message || "Unable to load this listing."))
      .finally(() => setLoading(false));
  }, [id]);

  const requestSwap = async () => {
    if (!localStorage.getItem("token")) {
      window.location.assign("/login");
      return;
    }
    try {
      await API.post("/swaps", {
        clothingId: clothing._id,
        message: "Hi, I am interested in swapping for this clothing item.",
      });
      setSent(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send your swap request.");
    }
  };

  if (loading) return <main className="clothing-details"><p>Loading listing…</p></main>;
  if (error && !clothing) return <main className="clothing-details"><p role="alert">{error}</p><Link to="/browse">Back to browse</Link></main>;
  if (!clothing) return null;

  return (
    <main className="clothing-details">
      <Link to="/browse">← Back to browse</Link>
      <article>
        {clothing.image && <img src={clothing.image} alt={clothing.title} />}
        <div>
          <p>{clothing.status}</p>
          <h1>{clothing.title}</h1>
          <p>{clothing.description}</p>
          <dl>
            <dt>Category</dt><dd>{clothing.category} · {clothing.type}</dd>
            <dt>Size</dt><dd>{clothing.size}</dd>
            <dt>Condition</dt><dd>{clothing.condition}</dd>
            <dt>Brand</dt><dd>{clothing.brand || "Not specified"}</dd>
            <dt>Estimated swap value</dt><dd>₹{clothing.estimatedValue}</dd>
            <dt>Location</dt><dd>{clothing.location || clothing.owner?.location || "Not specified"}</dd>
          </dl>
          {error && <p role="alert">{error}</p>}
          {sent ? <p role="status">Swap request sent. You can follow its progress under Swap requests.</p> : <button type="button" onClick={requestSwap} disabled={clothing.status !== "Available"}>Request a swap</button>}
        </div>
      </article>
    </main>
  );
}
