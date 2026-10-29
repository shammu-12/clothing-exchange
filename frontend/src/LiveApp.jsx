/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import API from "./services/api";
import "./LiveApp.css";

const imageUrl = (value) => {
  if (!value) return "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80";
  if (!value.startsWith("/")) return value;
  const configured = import.meta.env.VITE_API_URL?.trim();
  if (!configured) return value;
  const origin = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
  return `${origin.replace(/\/+$/, "").replace(/\/api$/i, "")}${value}`;
};
const initials = (name = "Rewear") => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const storedUser = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
const authenticated = () => Boolean(localStorage.getItem("token"));
const locationPointFromPosition = ({ coords }) => ({ type: "Point", coordinates: [Number(coords.longitude.toFixed(2)), Number(coords.latitude.toFixed(2))] });
const currentApproximateLocation = () => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error("Location is not available in this browser."));
  navigator.geolocation.getCurrentPosition(resolve, (error) => reject(new Error(error.code === 1 ? "Location permission was not granted." : "Unable to get your location. Try entering a city or neighbourhood instead.")), { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
});
const distanceKm = (firstPoint, secondPoint) => {
  const [lon1, lat1] = firstPoint.coordinates;
  const [lon2, lat2] = secondPoint.coordinates;
  const rad = (degrees) => degrees * Math.PI / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const recommendationScore = (item, wardrobe) => {
  if (!wardrobe.length) return 0;
  return wardrobe.reduce((best, piece) => {
    let score = 0;
    if (piece.category && piece.category === item.category) score += 4;
    if (piece.size && piece.size.toLowerCase() === (item.size || "").toLowerCase()) score += 4;
    if (piece.type && item.type && piece.type.toLowerCase() === item.type.toLowerCase()) score += 3;
    if (piece.color && item.color && piece.color.toLowerCase() === item.color.toLowerCase()) score += 2;
    if (piece.brand && item.brand && piece.brand.toLowerCase() === item.brand.toLowerCase()) score += 1;
    if (Number.isFinite(piece.estimatedValue) && Number.isFinite(item.estimatedValue)) {
      const gap = Math.abs(piece.estimatedValue - item.estimatedValue);
      score += gap <= 250 ? 3 : gap <= 500 ? 2 : gap <= 1000 ? 1 : 0;
    }
    if (Number.isFinite(item.distanceKm)) score += item.distanceKm <= 10 ? 2 : item.distanceKm <= 25 ? 1 : 0;
    return Math.max(best, score);
  }, 0);
};

function Shell({ children }) {
  const user = storedUser();
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => {
    const available = (event) => { event.preventDefault(); setInstallPrompt(event); };
    const installed = () => setInstallPrompt(null);
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    return () => { window.removeEventListener("beforeinstallprompt", available); window.removeEventListener("appinstalled", installed); };
  }, []);
  const install = async () => { if (!installPrompt) return; await installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); };
  return <><header className="live-nav"><Link to="/browse" className="live-brand"><span className="live-brand-mark">↻</span>rewear<span className="brand-period">.</span></Link><nav><Link to="/browse">Discover</Link><Link to="/nearby">Nearby</Link><Link to="/community">Community</Link><Link to="/my-listings">My wardrobe</Link><Link to="/swap-requests">Swap requests</Link>{user?.role === "admin" && <Link to="/admin">Admin</Link>}</nav><div className="nav-right">{installPrompt && <button className="live-button secondary nav-install" type="button" onClick={install}>Install app</button>}<Link className="live-button nav-list" to={user ? "/add-clothing" : "/login"}>＋ List a piece</Link><Link className="live-avatar" to={user ? "/profile" : "/login"}>{initials(user?.name || "Sign in")}</Link></div></header>{children}</>;
}
function Notice({ error, children }) { return error ? <p className="live-error" role="alert">{error}</p> : children || null; }
function Loading() { return <div className="live-loading">Loading your Rewear experience…</div>; }
function ApproximateLocationPicker({ value, onChange }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const choose = async () => {
    setError("");
    setLoading(true);
    try { onChange(locationPointFromPosition(await currentApproximateLocation())); }
    catch (err) { setError(err.message || "Unable to get your location."); }
    finally { setLoading(false); }
  };
  return <div className="approx-location-picker"><button type="button" className="live-button secondary" onClick={choose} disabled={loading}>{loading ? "Getting location…" : value ? "Update approximate location" : "Add approximate location"}</button><span>{value ? "Approximate location is attached (rounded to about 1 km)." : "Optional. Your browser asks permission; only an approximate point is saved."}</span>{value && <button type="button" className="live-text-button" onClick={() => onChange(null)}>Remove map location</button>}{error && <p className="live-error" role="alert">{error}</p>}</div>;
}
function RequireAuth({ children }) { return authenticated() ? children : <Navigate to="/login" replace />; }
function ListingCard({ item, onSwap, mine = false, onDelete }) { return <article className="live-card"><img src={imageUrl(item.image)} alt={item.title} /><div className="live-card-body"><div className="live-card-top"><h3>{item.title}</h3><span>₹{item.estimatedValue || 0}</span></div><p>{item.brand || item.type} · {item.size} · {item.condition}</p><p className="live-muted">{item.location || item.owner?.location || "Location not specified"}{Number.isFinite(item.distanceKm) ? ` · ${item.distanceKm < 10 ? item.distanceKm.toFixed(1) : Math.round(item.distanceKm)} km away` : ""}</p><span className={`live-status ${item.status?.toLowerCase()}`}>{item.status || "Available"}</span>{mine ? <div className="live-actions"><Link className="live-button secondary" to={`/edit-listing/${item._id}`}>Edit</Link><button className="live-button danger" onClick={() => onDelete(item._id)}>Remove</button></div> : <div className="live-actions"><Link className="live-button secondary" to={`/clothing/${item._id}`}>Details</Link><button className="live-button" disabled={item.status !== "Available"} onClick={() => onSwap(item)}>Request swap</button></div>}</div></article>; }

function ReportButton({ targetType, targetId, label = "Report" }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(targetType === "Swap" ? "Swap dispute" : "Safety concern");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await API.post("/reports", { targetType, targetId, reason, details });
      setMessage("Sent to the moderation team.");
      setOpen(false);
    } catch (err) { setError(err.response?.data?.message || "Unable to send your report."); }
  };
  if (!authenticated()) return <Link className="live-text-button" to="/login">Sign in to report</Link>;
  return <div className="report-control"><button className="live-text-button" type="button" onClick={() => setOpen(!open)}>{open ? "Cancel" : label}</button>{message && <small role="status">{message}</small>}{open && <form onSubmit={submit}><label>Reason<select value={reason} onChange={(event) => setReason(event.target.value)}><option>Safety concern</option><option>Inappropriate content</option><option>Misleading listing</option><option>Swap dispute</option><option>Other</option></select></label><label>Details<textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={1500} placeholder="Tell the moderation team what happened (optional)."/></label>{error && <Notice error={error}/>}<button className="live-button">Send report</button></form>}</div>;
}

function SwapRequestModal({ item, close, onSubmit }) {
  const [wardrobe, setWardrobe] = useState([]); const [offerId, setOfferId] = useState(""); const [note, setNote] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false);
  useEffect(() => { API.get("/clothing/my").then(({data}) => { const available=(data.clothing||[]).filter((piece)=>piece.status==="Available"&&piece._id!==item._id); setWardrobe(available); if(available.length)setOfferId(available[0]._id); }).catch((err)=>setError(err.response?.data?.message||"Unable to load your available wardrobe.")).finally(()=>setLoading(false)); },[item._id]);
  const offer=wardrobe.find((piece)=>piece._id===offerId); const difference=offer?(offer.estimatedValue||0)-(item.estimatedValue||0):0;
  const submit=async(event)=>{event.preventDefault();if(!offerId)return;setSending(true);setError("");try{await onSubmit(item,offerId,note.trim())}catch(err){setError(err.response?.data?.message||"Unable to send your swap request.")}finally{setSending(false)}};
  return <div className="live-modal" role="dialog" aria-modal="true" aria-labelledby="swap-modal-title"><form onSubmit={submit}><button type="button" className="live-close" onClick={close} aria-label="Close">×</button><p className="live-kicker">A PIECE FOR A PIECE</p><h2 id="swap-modal-title">Put forward a swap</h2><p className="swap-modal-intro">Choose one available piece from your wardrobe to offer for <b>{item.title}</b>.</p>{!authenticated()?<div className="live-empty"><p>Sign in to choose an item from your wardrobe.</p><Link className="live-button" to="/login">Sign in to continue ↗</Link></div>:loading?<Loading/>:wardrobe.length===0?<div className="live-empty"><h3>No available pieces yet</h3><p>List an item first, then come back to propose a swap.</p><Link className="live-button" to="/add-clothing">List a piece ↗</Link></div>:<><label className="swap-offer-field">Your offer<select value={offerId} onChange={(event)=>setOfferId(event.target.value)}>{wardrobe.map((piece)=><option value={piece._id} key={piece._id}>{piece.title} · ₹{piece.estimatedValue||0} · {piece.size}</option>)}</select></label>{offer&&<div className="swap-comparison"><div><img src={imageUrl(offer.image)} alt=""/><span><small>YOU OFFER</small><b>{offer.title}</b><strong>₹{offer.estimatedValue||0}</strong></span></div><i>↔</i><div><img src={imageUrl(item.image)} alt=""/><span><small>YOU RECEIVE</small><b>{item.title}</b><strong>₹{item.estimatedValue||0}</strong></span></div><p>{difference===0?"Estimated values are evenly matched.":difference>0?`Your piece is estimated ₹${difference} higher.`:`Your piece is estimated ₹${Math.abs(difference)} lower.`} Values are suggestions for your conversation; no money is exchanged.</p></div>}<label className="swap-offer-field">A note for the owner<textarea value={note} onChange={(event)=>setNote(event.target.value)} placeholder="Say hello and tell them why these pieces could make a good swap…" maxLength={500}/></label>{error&&<Notice error={error}/>}<button className="live-button swap-submit" disabled={sending||!offerId}>{sending?"Sending request…":"Send swap request ↗"}</button></>}</form></div>;
}

function Browse({ nearby = false }) {
  const [items, setItems] = useState([]);
  const [wardrobe, setWardrobe] = useState([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [locationPoint, setLocationPoint] = useState(null);
  const [radiusKm, setRadiusKm] = useState("10");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const load = async (selectedCategory = category, selectedLocation = location, selectedPoint = locationPoint, selectedRadius = radiusKm) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/clothing", {
        params: {
          available: true,
          search: query || undefined,
          category: selectedCategory || undefined,
          location: (nearby ? selectedLocation : "") || undefined,
          lat: nearby && selectedPoint ? selectedPoint.coordinates[1] : undefined,
          lng: nearby && selectedPoint ? selectedPoint.coordinates[0] : undefined,
          radiusKm: nearby && selectedPoint ? selectedRadius : undefined,
        },
      });
      const userId = storedUser()?.id;
      const listings = (data.clothing || []).filter((item) => item.owner?._id !== userId).map((item) => ({
        ...item,
        distanceKm: selectedPoint && item.locationPoint ? distanceKm(selectedPoint, item.locationPoint) : undefined,
      }));
      setItems(listings);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load listings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (authenticated()) API.get("/clothing/my").then(({ data }) => setWardrobe(data.clothing || [])).catch(() => setWardrobe([]));
  }, []);

  const recommendations = wardrobe.length
    ? items.map((item) => ({ item, score: recommendationScore(item, wardrobe) }))
      .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(({ item }) => item)
    : [];

  const useMyLocation = async () => {
    setError("");
    try {
      const point = locationPointFromPosition(await currentApproximateLocation());
      setLocationPoint(point);
      await load(category, location, point, radiusKm);
    } catch (err) {
      setError(err.message || "Unable to get your location.");
    }
  };

  const request = async (item, offeredClothingId, message) => {
    if (!authenticated()) throw new Error("Please sign in before requesting a swap.");
    await API.post("/swaps", { clothingId: item._id, offeredClothingId, message });
    setSelected(null);
  };

  return (
    <Shell>
      <main className="live-page">
        <section className="live-hero">
          <div className="hero-copy">
            <p className="live-kicker">A MORE THOUGHTFUL WAY TO GET DRESSED</p>
            <h1>Good clothes.<br/><em>New stories.</em></h1>
            <p>Swap the pieces you’ve outgrown for something you’ll love next. Better for your wardrobe, lighter on the planet.</p>
            <div className="hero-actions">
              <Link className="live-button" to={authenticated() ? "/add-clothing" : "/register"}>Share a piece <span>↗</span></Link>
              <a className="hero-link" href="#discover">Explore the community ↓</a>
            </div>
          </div>
          <div className="hero-photo">
            <img src="https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=85" alt="A thoughtfully styled secondhand wardrobe"/>
            <div className="hero-note"><span>↻</span><div><b>Wear it again</b><small>Every swap keeps good clothes moving.</small></div></div>
          </div>
          <div className="hero-count"><b>01</b><span>STYLE THAT CIRCULATES</span></div>
        </section>

        <section id="discover" className="discover-intro">
          <div><p className="live-kicker">GOOD FINDS, AROUND THE CORNER</p><h2>{nearby ? "A little closer to home." : "Find your next favourite."}</h2><p>One-of-a-kind pieces, shared by people in your community.</p></div>
          <Link className="discover-nearby" to={nearby ? "/browse" : "/nearby"}>{nearby ? "Browse everything" : "Explore nearby"} <span>↗</span></Link>
        </section>

        <form className="live-filters" onSubmit={(event) => { event.preventDefault(); load(); }}>
          <label className="filter-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘linen’, ‘Levi’s’, or ‘summer dress’"/></label>
          {nearby && <label className="filter-location"><span>⌖</span><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or neighbourhood"/></label>}
          <button className="live-button" type="submit">Find pieces <span>↗</span></button>
        </form>
        {nearby && <section className="nearby-match-controls"><div><b>Match by distance</b><p>Use your approximate location to sort available pieces by distance. Only a rounded, neighbourhood-level point is saved with a listing.</p></div><button className="live-button secondary" type="button" onClick={useMyLocation}>{locationPoint ? "Refresh my location" : "Use my approximate location"}</button><label>Within <select value={radiusKm} onChange={(event) => { setRadiusKm(event.target.value); if (locationPoint) load(category, location, locationPoint, event.target.value); }}><option value="5">5 km</option><option value="10">10 km</option><option value="25">25 km</option><option value="50">50 km</option><option value="100">100 km</option></select></label>{locationPoint && <span className="nearby-active">Closest first · approximate location</span>}</section>}

        <div className="category-row">
          <div className="category-chips">{[["", "Everything"], ["Women", "For her"], ["Men", "For him"], ["Unisex", "Unisex"], ["Kids", "For kids"]].map(([value, label]) => <button type="button" key={value || "all"} onClick={() => { setCategory(value); load(value); }} className={category === value ? "active" : ""}>{label}</button>)}</div>
          <span className="listing-count">{items.length ? `${items.length} pieces to discover` : "A community closet, just for you"}</span>
        </div>

        <Notice error={error}/>
        {!loading && recommendations.length > 0 && <section className="smart-recommendations"><div className="smart-recommendations-heading"><div><p className="live-kicker">PRIVATE STYLE MATCHES</p><h2>Picked for your wardrobe.</h2><p>Matched on size, category, style, value and distance in your browser. Your wardrobe details aren’t sent to an AI service.</p></div><span aria-hidden="true">✳</span></div><div className="live-grid">{recommendations.map((item) => <ListingCard key={`match-${item._id}`} item={item} onSwap={setSelected}/>)}</div></section>}
        {loading ? <Loading/> : items.length ? <div className="live-grid">{items.map((item) => <ListingCard key={item._id} item={item} onSwap={setSelected}/>)}</div> : <div className="live-empty"><h3>{nearby && locationPoint ? "No mapped pieces in this radius yet" : "No listings found just yet"}</h3><p>{nearby && locationPoint ? "Try a wider radius, or look for listings whose owners added an approximate map location." : "Try another search, or be the first to give a great piece a new story."}</p><Link className="live-button" to={authenticated() ? "/add-clothing" : "/register"}>List a piece ↗</Link></div>}

        <section className="how-it-works"><p className="live-kicker">THREE LITTLE STEPS</p><h2>A refresh, without the retail.</h2><div className="how-steps"><article><span>01</span><h3>Share what you love</h3><p>List a well-kept piece and give it a second story.</p></article><article><span>02</span><h3>Find a lovely match</h3><p>Explore your community and send a thoughtful swap request.</p></article><article><span>03</span><h3>Make the exchange</h3><p>Chat, agree on a fair swap, and exchange locally.</p></article></div></section>
      </main>
      <footer className="live-footer"><Link to="/browse" className="live-brand"><span className="live-brand-mark">↻</span>rewear<span className="brand-period">.</span></Link><span>Wear well. Share more. Waste less.</span><span>Good things deserve another go.</span></footer>
      {selected && <SwapRequestModal item={selected} close={() => setSelected(null)} onSubmit={request}/>}
    </Shell>
  );
}
function Auth({ register = false }) { const navigate = useNavigate(); const [mode, setMode] = useState(register); const [form, setForm] = useState({ name: "", email: "", password: "", location: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false); const submit = async (event) => { event.preventDefault(); setLoading(true); setError(""); try { const { data } = await API.post(mode ? "/auth/register" : "/auth/login", mode ? form : { email: form.email, password: form.password }); localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user)); navigate("/dashboard"); } catch (err) { setError(err.response?.data?.message || "Please try again."); } finally { setLoading(false); } }; const field = (name, label, type = "text", required = true) => <label>{label}<input type={type} required={required} minLength={mode && name === "password" ? 8 : undefined} autoComplete={name === "password" ? mode ? "new-password" : "current-password" : name === "email" ? "email" : undefined} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} /></label>; return <main className="live-auth"><form onSubmit={submit}><Link className="live-brand" to="/browse">↺ Rewear</Link><h1>{mode ? "Join Rewear" : "Welcome back"}</h1>{mode && field("name", "Full name")}{field("email", "Email", "email")}{field("password", "Password", "password")}{mode && field("location", "Location", "text", false)}<Notice error={error} /><button className="live-button" disabled={loading}>{loading ? "Please wait…" : mode ? "Create account" : "Sign in"}</button><button className="live-text-button" type="button" onClick={() => { setMode(!mode); setError(""); }}>{mode ? "Already a member? Sign in" : "New here? Create an account"}</button></form></main>; }

function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "Unisex", type: "", size: "M", condition: "Like New", brand: "", color: "", location: "", locationPoint: null, image: "" });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      let image = form.image;
      if (file) { const data = new FormData(); data.append("image", file); const response = await API.post("/uploads/image", data, { headers: { "Content-Type": "multipart/form-data" } }); image = response.data.image; }
      await API.post("/clothing", { ...form, image });
      navigate("/my-listings");
    } catch (err) { setError(err.response?.data?.message || "Unable to publish listing."); }
    finally { setSaving(false); }
  };
  return <Shell><main className="live-page narrow"><Link to="/my-listings">← Back to wardrobe</Link><h1>List an item</h1><p>We calculate a fair swap value using category, condition, and brand.</p><form className="live-form" onSubmit={submit}>
    <label>Item name<input required value={form.title} onChange={(e) => change("title", e.target.value)} /></label>
    <label>Description<textarea required value={form.description} onChange={(e) => change("description", e.target.value)} /></label>
    <div className="live-two"><label>Category<select value={form.category} onChange={(e) => change("category", e.target.value)}><option>Unisex</option><option>Women</option><option>Men</option><option>Kids</option></select></label><label>Type<input required placeholder="e.g. Denim jacket" value={form.type} onChange={(e) => change("type", e.target.value)} /></label><label>Size<input required value={form.size} onChange={(e) => change("size", e.target.value)} /></label><label>Condition<select value={form.condition} onChange={(e) => change("condition", e.target.value)}><option>New</option><option>Like New</option><option>Good</option><option>Used</option></select></label><label>Brand<input value={form.brand} onChange={(e) => change("brand", e.target.value)} /></label><label>Colour<input value={form.color} onChange={(e) => change("color", e.target.value)} /></label></div>
    <label>City or neighbourhood<input required value={form.location} onChange={(e) => change("location", e.target.value)} /></label>
    <ApproximateLocationPicker value={form.locationPoint} onChange={(point) => change("locationPoint", point)} />
    <label>Photo upload<input accept="image/*" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><label>Or photo URL<input type="url" value={form.image} onChange={(e) => change("image", e.target.value)} /></label>
    <Notice error={error} /><button className="live-button" disabled={saving}>{saving ? "Publishing…" : "Publish listing"}</button>
  </form></main></Shell>;
}
function MyListings() { const [items, setItems] = useState([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const load = async () => { try { const { data } = await API.get("/clothing/my"); setItems(data.clothing || []); } catch (err) { setError(err.response?.data?.message || "Unable to load your listings."); } finally { setLoading(false); } }; useEffect(() => { load(); }, []); const remove = async (id) => { if (!window.confirm("Remove this listing?")) return; try { await API.delete(`/clothing/${id}`); setItems(items.filter((item) => item._id !== id)); } catch (err) { setError(err.response?.data?.message || "Unable to remove listing."); } }; return <Shell><main className="live-page"><div className="live-heading"><div><h1>My wardrobe</h1><p>Manage the clothes you have shared.</p></div><Link className="live-button" to="/add-clothing">List an item</Link></div><Notice error={error} />{loading ? <Loading /> : items.length ? <div className="live-grid">{items.map((item) => <ListingCard key={item._id} item={item} mine onDelete={remove} />)}</div> : <div className="live-empty"><h3>Your wardrobe is empty</h3><Link className="live-button" to="/add-clothing">List your first item</Link></div>}</main></Shell>; }

function EditListing() {
  const { id } = useParams(); const navigate = useNavigate(); const [form, setForm] = useState(null); const [error, setError] = useState("");
  useEffect(() => { API.get(`/clothing/${id}`).then(({ data }) => setForm(data.clothing)).catch((err) => setError(err.response?.data?.message || "Unable to load listing.")); }, [id]);
  if (!form) return <Shell><main className="live-page"><Notice error={error} /><Loading /></main></Shell>;
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => { event.preventDefault(); try { await API.put(`/clothing/${id}`, form); navigate("/my-listings"); } catch (err) { setError(err.response?.data?.message || "Unable to update listing."); } };
  return <Shell><main className="live-page narrow"><h1>Edit listing</h1><form className="live-form" onSubmit={submit}>{["title", "description", "type", "size", "brand", "color", "location", "image"].map((field) => <label key={field}>{field}<input value={form[field] || ""} onChange={(e) => change(field, e.target.value)} /></label>)}<ApproximateLocationPicker value={form.locationPoint} onChange={(point) => change("locationPoint", point)} /><label>Condition<select value={form.condition} onChange={(e) => change("condition", e.target.value)}><option>New</option><option>Like New</option><option>Good</option><option>Used</option></select></label><Notice error={error} /><button className="live-button">Save changes</button></form></main></Shell>;
}
function Requests() {
  const [tab, setTab] = useState("received");
  const [requests, setRequests] = useState({ sent: [], received: [] });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const load = async () => {
    try {
      const [sent, received] = await Promise.all([API.get("/swaps/sent"), API.get("/swaps/received")]);
      setRequests({ sent: sent.data.requests || [], received: received.data.requests || [] });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load swap requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const update = async (requestId, status) => {
    setUpdating(requestId);
    setError("");
    try {
      await API.put(`/swaps/${requestId}`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update request.");
    } finally {
      setUpdating("");
    }
  };

  const confirmCompletion = async (requestId) => {
    setUpdating(requestId);
    setError("");
    try {
      await API.post(`/swaps/${requestId}/completion`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to confirm swap completion.");
    } finally {
      setUpdating("");
    }
  };

  const list = requests[tab];

  return (
    <Shell>
      <main className="live-page requests-page">
        <p className="live-kicker">YOUR EXCHANGES, ALL IN ONE PLACE</p>
        <h1>Swap requests</h1>
        <p className="requests-intro">Say hello, talk through the details, and keep each exchange on track.</p>
        <div className="live-tabs">
          <button className={tab === "received" ? "active" : ""} onClick={() => setTab("received")}>Incoming <b>{requests.received.filter((request) => request.status === "Pending").length}</b></button>
          <button className={tab === "sent" ? "active" : ""} onClick={() => setTab("sent")}>Sent <b>{requests.sent.length}</b></button>
        </div>
        <Notice error={error}/>
        {loading ? <Loading/> : list.length ? <div className="live-request-list">
          {list.map((request) => {
            const offer = request.offeredClothing;
            const wanted = request.clothing;
            const valueDifference = offer && wanted ? (offer.estimatedValue || 0) - (wanted.estimatedValue || 0) : null;
            return <article className="live-request" key={request._id}>
              <img src={imageUrl(wanted?.image)} alt={wanted?.title || "Requested clothing"}/>
              <div>
                <span className={`live-status ${request.status.toLowerCase()}`}>{request.status}</span>
                <h3>{wanted?.title || "Listing unavailable"}</h3>
                <p>{tab === "received" ? `${request.requester?.name} would like to swap for your piece` : `You asked ${request.owner?.name} about this piece`}</p>
                {offer ? <div className="request-offer"><img src={imageUrl(offer.image)} alt=""/><span><small>{tab === "received" ? "THEIR OFFER" : "YOUR OFFER"}</small><b>{offer.title}</b><strong>₹{offer.estimatedValue || 0}</strong></span><span className="request-offer-arrow">↔</span><span className="request-wanted"><small>{tab === "received" ? "YOUR PIECE" : "THEIR PIECE"}</small><b>{wanted?.title}</b><strong>₹{wanted?.estimatedValue || 0}</strong></span></div> : <p className="live-muted">{request.message || "No message supplied"}</p>}
                {offer && valueDifference !== null && <p className="request-value-note">{valueDifference === 0 ? "Estimated values match." : valueDifference > 0 ? `Offer estimated ₹${valueDifference} higher.` : `Offer estimated ₹${Math.abs(valueDifference)} lower.`} Values are guides for discussion; no money is exchanged.</p>}
                {request.message && offer && <p className="request-message-text">“{request.message}”</p>}
                {request.status === "Accepted" && <p className="exchange-hint">Use chat to agree on the item condition and arrange a local hand-off or delivery. Both members confirm after the exchange.</p>}
                <div className="live-actions">
                  {tab === "received" && request.status === "Pending" && <><button className="live-button" disabled={updating === request._id} onClick={() => update(request._id, "Accepted")}>{updating === request._id ? "Updating…" : "Accept request"}</button><button className="live-button danger" disabled={updating === request._id} onClick={() => update(request._id, "Rejected")}>Decline</button></>}
                  {request.status === "Accepted" && <button className="live-button" disabled={updating === request._id || request.completionConfirmations?.some((id) => (id?._id || id).toString() === storedUser()?.id)} onClick={() => confirmCompletion(request._id)}>{updating === request._id ? "Saving…" : request.completionConfirmations?.some((id) => (id?._id || id).toString() === storedUser()?.id) ? "You confirmed · waiting for member" : "Confirm exchange complete"}</button>}
                  {request.status === "Completed" && <span className="exchange-hint">Confirmed by both members</span>}
                  <Link className="live-button secondary" to={`/chat/${request._id}`}>Open chat ↗</Link>
                </div>
              </div>
            </article>;
          })}
        </div> : <div className="live-empty"><h3>No {tab} requests yet</h3><p>{tab === "received" ? "When someone proposes a swap for one of your pieces, the request will appear here." : "Choose a piece from your wardrobe when you request a swap."}</p>{tab === "sent" && <Link className="live-button" to="/browse">Discover pieces ↗</Link>}</div>}
      </main>
    </Shell>
  );
}
function CourierPanel({ swapId, swap, setSwap }) {
  const [mode, setMode] = useState(swap.deliveryMode || "Local");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [status, setStatus] = useState("Preparing");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState("");
  const user = storedUser();
  const ownShipment = swap.shipments?.find((shipment) => (shipment.sender?._id || shipment.sender)?.toString() === user?.id);
  const otherShipments = swap.shipments?.filter((shipment) => (shipment.sender?._id || shipment.sender)?.toString() !== user?.id) || [];

  useEffect(() => {
    setMode(swap.deliveryMode || "Local");
    if (ownShipment) { setCarrier(ownShipment.carrier || ""); setTrackingNumber(ownShipment.trackingNumber || ""); setTrackingUrl(ownShipment.trackingUrl || ""); setStatus(ownShipment.status || "Preparing"); }
  }, [swap, swapId]);

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setSaved("");
    try {
      const payload = { deliveryMode: mode };
      if (mode === "Remote") Object.assign(payload, { carrier, trackingNumber, trackingUrl, status });
      const { data } = await API.patch(`/swaps/${swapId}/shipping`, payload);
      setSwap(data.request); setSaved("Delivery details saved.");
    } catch (err) { setError(err.response?.data?.message || "Unable to save delivery details."); }
    finally { setSaving(false); }
  };

  return <section className="courier-panel"><div className="courier-heading"><div><p className="live-kicker">LOCAL HAND-OFF OR REMOTE DELIVERY</p><h2>Plan the exchange</h2></div><span className={`courier-mode ${mode.toLowerCase()}`}>{mode}</span></div><p className="courier-explainer">Choose how you’ll exchange. For remote swaps, each person can add their own courier and tracking details.</p>
    <form onSubmit={save}><label>Exchange method<select value={mode} onChange={(event) => setMode(event.target.value)}><option>Local</option><option>Remote</option></select></label>
      {mode === "Remote" && <><div className="courier-fields"><label>Courier<input required maxLength={80} value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="e.g. India Post, DTDC, DHL" /></label><label>Tracking number<input maxLength={120} value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Add when the parcel is booked" /></label><label className="courier-url-field">Courier tracking URL<input type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} placeholder="https://… (optional)" /></label><label>Parcel status<select value={status} onChange={(event) => setStatus(event.target.value)}><option>Preparing</option><option>Label created</option><option>In transit</option><option>Delivered</option></select></label></div><small className="courier-note">Use your courier’s tracking page. Rewear stores the reference and link; booking and live carrier updates aren’t connected yet.</small></>}
      {error && <Notice error={error}/>}<div className="courier-save-row"><button className="live-button" disabled={saving || (mode === "Remote" && !carrier.trim())}>{saving ? "Saving…" : "Save delivery plan"}</button>{saved && <span>{saved}</span>}</div>
    </form>
    {mode === "Remote" && otherShipments.map((shipment) => <article className="courier-other" key={shipment._id}><b>{shipment.sender?.name || "Your swap partner"}’s parcel</b><span>{shipment.carrier} · {shipment.status}{shipment.trackingNumber ? ` · ${shipment.trackingNumber}` : ""}</span>{shipment.trackingUrl && <a href={shipment.trackingUrl} target="_blank" rel="noreferrer">Open tracking page ↗</a>}</article>)}
  </section>;
}

function Chat() {
  const { swapId } = useParams();
  const [messages, setMessages] = useState([]); const [body, setBody] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(true); const [swap, setSwap] = useState(null); const user = storedUser();
  const loadMessages = async (quiet = false) => {
    try { const { data } = await API.get(`/messages/${swapId}`); setMessages(data.messages || []); if (!quiet) setError(""); }
    catch (err) { setError(err.response?.data?.message || "Unable to load conversation."); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadMessages(); API.get(`/swaps/${swapId}`).then(({ data }) => setSwap(data.request)).catch((err) => setError(err.response?.data?.message || "Unable to load swap delivery details.")); const timer = setInterval(() => loadMessages(true), 5000); return () => clearInterval(timer); }, [swapId]);
  const send = async (event) => { event.preventDefault(); if (!body.trim()) return; try { const { data } = await API.post(`/messages/${swapId}`, { body: body.trim() }); setMessages((current) => [...current, data.message]); setBody(""); setError(""); } catch (err) { setError(err.response?.data?.message || "Unable to send message."); } };
  return <Shell><main className="live-page narrow chat-page"><Link to="/swap-requests">← Back to requests</Link><p className="live-kicker">A CONVERSATION ABOUT A GOOD SWAP</p><h1>Swap chat</h1><Notice error={error}/>{loading ? <Loading/> : <>{swap?.status === "Accepted" && <CourierPanel swapId={swapId} swap={swap} setSwap={setSwap}/>}<section className="live-chat"><div className="live-messages">{messages.length ? messages.map((message) => <p className={message.sender?._id === user?.id ? "mine" : ""} key={message._id}>{message.body}</p>) : <p className="live-muted">Say hello, share details, and agree how you’ll exchange your pieces.</p>}</div><form onSubmit={send}><input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" aria-label="Write a message"/><button className="live-button" disabled={!body.trim()}>Send ↗</button></form></section><ReportButton targetType="Swap" targetId={swapId} label="Raise a swap dispute" /></>}<p className="chat-note">For a smooth exchange, agree on item condition, hand-off or delivery, and timing in this chat.</p></main></Shell>;
}

function Profile() { const navigate = useNavigate(); const [user, setUser] = useState(null); const [error, setError] = useState(""); useEffect(() => { API.get("/auth/profile").then(({ data }) => setUser(data.user)).catch((err) => setError(err.response?.data?.message || "Unable to load profile.")); }, []); const save = async (event) => { event.preventDefault(); try { const { data } = await API.patch("/auth/profile", user); localStorage.setItem("user", JSON.stringify(data.user)); setUser(data.user); } catch (err) { setError(err.response?.data?.message || "Unable to update profile."); } }; const logout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/browse"); }; if (!user) return <Shell><main className="live-page"><Notice error={error} /><Loading /></main></Shell>; return <Shell><main className="live-page narrow"><h1>My profile</h1><form className="live-form" onSubmit={save}><label>Name<input value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} /></label><label>Location<input value={user.location || ""} onChange={(e) => setUser({ ...user, location: e.target.value })} /></label><label>Profile image URL<input value={user.profileImage || ""} onChange={(e) => setUser({ ...user, profileImage: e.target.value })} /></label><Notice error={error} /><button className="live-button">Save profile</button><button className="live-button danger" type="button" onClick={logout}>Sign out</button></form></main></Shell>; }

function Community() {
  const [posts, setPosts] = useState([]);
  const [impact, setImpact] = useState(null);
  const [topic, setTopic] = useState("All");
  const [body, setBody] = useState("");
  const [postTopic, setPostTopic] = useState("Swap story");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const user = storedUser();

  const load = async (selectedTopic = topic) => {
    try {
      const { data } = await API.get("/community", { params: { topic: selectedTopic } });
      setPosts(data.posts || []);
      setImpact(data.impact);
      setError("");
    } catch (err) { setError(err.response?.data?.message || "Unable to load community posts."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault(); setSending(true); setError("");
    try {
      const { data } = await API.post("/community", { topic: postTopic, body: body.trim() });
      setTopic("All"); setPosts((current) => [data.post, ...current]); setBody("");
    } catch (err) { setError(err.response?.data?.message || "Unable to share your post."); }
    finally { setSending(false); }
  };
  const like = async (post) => {
    if (!authenticated()) { setError("Sign in to appreciate a community post."); return; }
    try { const { data } = await API.post(`/community/${post._id}/like`); setPosts((current) => current.map((item) => item._id === post._id ? data.post : item)); }
    catch (err) { setError(err.response?.data?.message || "Unable to update your reaction."); }
  };

  return <Shell><main className="live-page community-page">
    <section className="community-hero"><div><p className="live-kicker">GOOD CLOTHES, GOOD PEOPLE</p><h1>Wear well.<br/><em>Share more.</em></h1><p>Swap stories, thoughtful care tips, and small ways to make fashion last.</p></div><div className="community-orbit"><span>REPAIR</span><b>↻</b><span>REWEAR</span><small>REPEAT</small></div></section>
    {impact && <section className="community-impact"><div><b>{impact.members.toLocaleString()}</b><span>community members</span></div><div><b>{impact.piecesShared.toLocaleString()}</b><span>pieces rehomed</span></div><div><b>{impact.completedSwaps.toLocaleString()}</b><span>completed swaps</span></div></section>}
    <div className="community-layout"><section className="community-feed"><div className="community-feed-heading"><div><p className="live-kicker">FROM THE COMMUNITY</p><h2>Ideas worth passing on.</h2></div><div className="community-topics">{["All", "Swap story", "Care & repair", "Slow fashion"].map((value) => <button type="button" key={value} className={topic === value ? "active" : ""} onClick={() => { setTopic(value); load(value); }}>{value}</button>)}</div></div>
      <Notice error={error}/>
      {authenticated() ? <form className="community-compose" onSubmit={submit}><label>Share a story, question, or useful tip<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} minLength={8} required placeholder="What have you learned about swapping, mending, or buying less?"/></label><div><select aria-label="Post topic" value={postTopic} onChange={(event) => setPostTopic(event.target.value)}><option>Swap story</option><option>Care & repair</option><option>Slow fashion</option></select><span>{body.length}/1000</span><button className="live-button" disabled={sending}>{sending ? "Sharing…" : "Share with the community ↗"}</button></div></form> : <div className="community-join"><span>Have a good rewear story?</span><Link className="live-button" to="/register">Join the community ↗</Link></div>}
      {loading ? <Loading/> : posts.length ? <div className="community-posts">{posts.map((post) => { const liked = post.likes?.some((id) => (id?._id || id).toString() === user?.id); return <article className="community-post" key={post._id}><header><span className="community-avatar">{initials(post.author?.name)}</span><div><b>{post.author?.name || "Rewear member"}</b><small>{post.author?.location || "Community member"} · {new Date(post.createdAt).toLocaleDateString()}</small></div><span className="community-topic">{post.topic}</span></header><p>{post.body}</p><footer><button type="button" className={liked ? "liked" : ""} onClick={() => like(post)} aria-label={liked ? "Remove appreciation" : "Appreciate this post"}>♡ {post.likes?.length || 0} appreciate</button><ReportButton targetType="CommunityPost" targetId={post._id} label="Report post" /></footer></article>; })}</div> : <div className="live-empty"><h3>A good idea can start here.</h3><p>Be the first to share a swap story, repair tip, or slower-fashion thought.</p></div>}
    </section><aside className="community-sidebar"><p className="live-kicker">SMALL HABITS, LONGER LIVES</p><h2>Make a little more of what you have.</h2><article><span>01 / CARE</span><b>Wash less, air more</b><p>Spot-clean when you can and let clothes air between wears.</p></article><article><span>02 / REPAIR</span><b>Fix one small thing</b><p>A loose button or tiny seam can give a favourite another season.</p></article><article><span>03 / SHARE</span><b>Pass pieces along</b><p>Swap the things you no longer reach for with someone who will.</p></article><Link to="/nearby">Find local swap pieces ↗</Link></aside></div>
  </main></Shell>;
}

function Dashboard() { const [stats, setStats] = useState(null); const [error, setError] = useState(""); const user = storedUser(); useEffect(() => { Promise.all([API.get("/clothing/my"), API.get("/swaps/sent"), API.get("/swaps/received")]).then(([listings, sent, received]) => { const pieces=listings.data.clothing||[]; const swaps=[...(sent.data.requests||[]),...(received.data.requests||[])]; setStats({pieces,swaps,pending:swaps.filter((item)=>item.status==="Pending").length,completed:swaps.filter((item)=>item.status==="Completed").length,value:pieces.reduce((sum,item)=>sum+(item.estimatedValue||0),0)}); }).catch((err)=>setError(err.response?.data?.message||"Unable to load your wardrobe overview.")); }, []); return <Shell><main className="live-page dashboard-page"><section className="dashboard-welcome"><div><p className="live-kicker">YOUR CIRCULAR WARDROBE</p><h1>Good to see you, {user?.name?.split(" ")[0]||"friend"}.</h1><p>Every piece you share makes a little more room for something new.</p></div><Link className="live-button" to="/add-clothing">＋ List a piece</Link></section><Notice error={error}/>{stats?<><div className="live-stats"><div><b>{stats.pieces.length}</b>Pieces shared</div><div><b>{stats.completed}</b>Swaps completed</div><div><b>{stats.pending}</b>Conversations in progress</div><div><b>₹{stats.value.toLocaleString("en-IN")}</b>Estimated wardrobe value</div></div><section className="dashboard-shortcuts"><Link to="/my-listings"><span>01</span><b>My wardrobe</b><small>Update or remove your pieces</small><i>↗</i></Link><Link to="/swap-requests"><span>02</span><b>Swap requests</b><small>Reply to your community</small><i>↗</i></Link><Link to="/nearby"><span>03</span><b>Find nearby</b><small>Discover pieces close to home</small><i>↗</i></Link></section><div className="dashboard-section-heading"><div><p className="live-kicker">YOUR LATEST PIECES</p><h2>Out in the world</h2></div><Link to="/my-listings">See your wardrobe ↗</Link></div>{stats.pieces.length?<div className="live-grid">{stats.pieces.slice(0,3).map((item)=><ListingCard item={item} key={item._id} mine onDelete={()=>{}}/>)}</div>:<div className="live-empty"><h3>Your wardrobe is ready for a first piece</h3><p>List a well-loved item to start your rewear story.</p><Link className="live-button" to="/add-clothing">List your first piece ↗</Link></div>}</>:!error&&<Loading/>}</main></Shell>; }

function Admin() {
  const user = storedUser();
  const [overview, setOverview] = useState(null);
  const [items, setItems] = useState([]);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [tab, setTab] = useState("Overview");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [overviewResponse, listingResponse, memberResponse, reportResponse, swapResponse] = await Promise.all([
        API.get("/admin/overview"), API.get("/admin/listings"), API.get("/admin/members"), API.get("/admin/reports"), API.get("/admin/swaps"),
      ]);
      setOverview(overviewResponse.data);
      setItems(listingResponse.data.listings || []);
      setMembers(memberResponse.data.members || []);
      setReports(reportResponse.data.reports || []);
      setSwaps(swapResponse.data.swaps || []);
      setError("");
    } catch (err) { setError(err.response?.data?.message || "Administrator access is required."); }
  };
  useEffect(() => { load(); }, []);

  const statusListing = async (id, status) => {
    try { const { data } = await API.patch(`/admin/listings/${id}`, { status }); setItems((current) => current.map((item) => item._id === id ? data.listing : item)); }
    catch (err) { setError(err.response?.data?.message || "Unable to update listing."); }
  };
  const statusMember = async (id, status) => {
    try { const { data } = await API.patch(`/admin/members/${id}`, { status }); setMembers((current) => current.map((member) => member._id === id ? data.member : member)); }
    catch (err) { setError(err.response?.data?.message || "Unable to update member."); }
  };
  const resolveReport = async (id, status) => {
    const resolution = window.prompt("Add a short moderation note (optional):", "");
    if (resolution === null) return;
    try { const { data } = await API.patch(`/admin/reports/${id}`, { status, resolution }); setReports((current) => current.map((report) => report._id === id ? { ...report, ...data.report } : report)); }
    catch (err) { setError(err.response?.data?.message || "Unable to update report."); }
  };
  const downloadReport = async () => {
    try {
      const { data } = await API.get("/admin/analytics.csv", { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url; link.download = "rewear-marketplace-report.csv"; link.click(); URL.revokeObjectURL(url);
    } catch (err) { setError(err.response?.data?.message || "Unable to download analytics."); }
  };

  const tabs = ["Overview", "Members", "Listings", "Swap activity", "Reports"];
  return <Shell><main className="live-page admin-page">
    <p className="live-kicker">COMMUNITY CARE & PLATFORM HEALTH</p><h1>Admin panel</h1>
    <p>Review members, exchange activity, reports, and marketplace listings.</p>
    <Notice error={error}/>
    {overview ? <div className="live-stats"><div><b>{overview.users}</b>Members</div><div><b>{overview.listings}</b>Available listings</div><div><b>{overview.successfulSwaps}</b>Completed swaps</div><div><b>{overview.pendingSwaps}</b>Pending requests</div></div> : !error && <Loading/>}
    <section className="admin-analytics"><div><h2>Marketplace analytics</h2><p>{overview?.totalRequests ?? 0} total swap requests · {overview?.conversionRate ?? 0}% completed-request rate</p><small>Completed swaps divided by all recorded swap requests.</small></div><button className="live-button secondary" type="button" onClick={downloadReport}>Download CSV report</button></section>
    <div className="live-tabs" role="tablist">{tabs.map((value) => <button type="button" role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} key={value} onClick={() => setTab(value)}>{value}{value === "Reports" ? ` (${reports.filter((report) => report.status === "Open").length} open)` : ""}</button>)}</div>
    {tab === "Overview" && <div className="admin-overview-links"><p>Open reports: <b>{reports.filter((report) => report.status === "Open").length}</b></p><p>Recent swap records: <b>{swaps.length}</b></p><button className="live-button secondary" onClick={load}>Refresh marketplace data</button></div>}
    {tab === "Listings" && <><div className="admin-list-heading"><h2>Clothing listings</h2><span>{items.length} records</span></div><div className="live-admin-list">{items.map((item) => <article key={item._id}><div className="admin-listing-label"><img src={imageUrl(item.image)} alt=""/><span><b>{item.title}</b><small>{item.owner?.name} · {item.location || item.owner?.location || "No location"}</small></span></div><select aria-label={`Moderate ${item.title}`} value={item.status} onChange={(event) => statusListing(item._id, event.target.value)}><option>Available</option><option>Reserved</option><option>Swapped</option><option>Removed</option></select></article>)}</div></>}
    {tab === "Members" && <div className="admin-record-list">{members.map((member) => <article key={member._id}><div><b>{member.name}</b><small>{member.email} · {member.location || "No location"} · {member.role}</small></div><div><span className={`live-status ${member.accountStatus === "Suspended" ? "removed" : "available"}`}>{member.accountStatus || "Active"}</span>{member._id !== user?.id && <button className="live-button secondary" onClick={() => statusMember(member._id, member.accountStatus === "Suspended" ? "Active" : "Suspended")}>{member.accountStatus === "Suspended" ? "Restore account" : "Suspend account"}</button>}</div></article>)}</div>}
    {tab === "Swap activity" && <div className="admin-record-list">{swaps.map((swap) => <article key={swap._id}><div><b>{swap.clothing?.title || "Listing"} ↔ {swap.offeredClothing?.title || "Offer"}</b><small>{swap.requester?.name || "Member"} and {swap.owner?.name || "Member"} · Updated {new Date(swap.updatedAt).toLocaleDateString()}</small></div><span className={`live-status ${swap.status?.toLowerCase()}`}>{swap.status}</span></article>)}</div>}
    {tab === "Reports" && <div className="admin-record-list">{reports.length ? reports.map((report) => <article key={report._id}><div><b>{report.targetType} · {report.reason}</b><small>Reported by {report.reporter?.name || "Member"} · {report.details || "No additional details"}</small>{report.target?.title && <small>Item: {report.target.title}</small>}{report.target?.clothing?.title && <small>Requested item: {report.target.clothing.title}</small>}{report.target?.offeredClothing?.title && <small>Offered item: {report.target.offeredClothing.title}</small>}{report.target?.body && <small>Post: {report.target.body}</small>}{report.resolution && <small>Resolution: {report.resolution}</small>}</div><div><span className={`live-status ${report.status.toLowerCase()}`}>{report.status}</span>{report.status === "Open" && <><button className="live-button" onClick={() => resolveReport(report._id, "Resolved")}>Resolve</button><button className="live-button secondary" onClick={() => resolveReport(report._id, "Dismissed")}>Dismiss</button></>}</div></article>) : <div className="live-empty"><h3>No reports yet</h3><p>Member reports and swap disputes will appear here.</p></div>}</div>}
  </main></Shell>;
}

export default function LiveApp() { return <Routes><Route path="/" element={<Navigate to="/browse" replace />} /><Route path="/browse" element={<Browse />} /><Route path="/nearby" element={<Browse nearby />} /><Route path="/community" element={<Community />} /><Route path="/login" element={<Auth />} /><Route path="/register" element={<Auth register />} /><Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} /><Route path="/add-clothing" element={<RequireAuth><AddListing /></RequireAuth>} /><Route path="/my-listings" element={<RequireAuth><MyListings /></RequireAuth>} /><Route path="/edit-listing/:id" element={<RequireAuth><EditListing /></RequireAuth>} /><Route path="/swap-requests" element={<RequireAuth><Requests /></RequireAuth>} /><Route path="/chat/:swapId" element={<RequireAuth><Chat /></RequireAuth>} /><Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} /><Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} /><Route path="/clothing/:id" element={<ListingDetails />} /><Route path="*" element={<Navigate to="/browse" replace />} /></Routes>; }
function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => {
    API.get(`/clothing/${id}`)
      .then(({ data }) => setItem(data.clothing))
      .catch((err) => setError(err.response?.data?.message || "Listing not found."));
  }, [id]);

  const request = async (listing, offeredClothingId, message) => {
    await API.post("/swaps", { clothingId: listing._id, offeredClothingId, message });
    navigate("/swap-requests");
  };

  const startRequest = () => {
    if (!authenticated()) {
      navigate("/login");
      return;
    }
    setRequestOpen(true);
  };

  return (
    <Shell>
      <main className="live-page">
        {error && <Notice error={error}/>}
        {!item ? <Loading/> : <>
          <Link to="/browse" className="detail-back">← Back to the collection</Link>
          <article className="live-detail">
            <div className="detail-photo"><img src={imageUrl(item.image)} alt={item.title}/><span className={`live-status ${item.status.toLowerCase()}`}>{item.status}</span></div>
            <div className="detail-copy">
              <p className="live-kicker">A PIECE WITH A PAST, READY FOR ITS NEXT CHAPTER</p>
              <h1>{item.title}</h1>
              <p className="detail-owner">Shared by <b>{item.owner?.name || "A Rewear neighbour"}</b>{item.location || item.owner?.location ? ` · ${item.location || item.owner?.location}` : ""}</p>
              <p className="detail-description">{item.description}</p>
              <dl><dt>Brand</dt><dd>{item.brand || "Independent / unbranded"}</dd><dt>Category</dt><dd>{item.category} · {item.type}</dd><dt>Size</dt><dd>{item.size}</dd><dt>Condition</dt><dd>{item.condition}</dd></dl>
              <div className="detail-value"><span>Estimated swap value</span><b>₹{item.estimatedValue}</b><small>A helpful starting point for your conversation.</small></div>
              <button className="live-button detail-request" disabled={item.status !== "Available" || item.owner?._id === storedUser()?.id} onClick={startRequest}>{item.status !== "Available" ? "This piece is no longer available" : item.owner?._id === storedUser()?.id ? "This is your listing" : "Choose a piece to offer ↗"}</button>
              <p className="detail-privacy">Compare a piece from your wardrobe before sending a request. No money is exchanged.</p>
              <ReportButton targetType="Listing" targetId={item._id} label="Report this listing" />
            </div>
          </article>
        </>}
      </main>
      {requestOpen && item && <SwapRequestModal item={item} close={() => setRequestOpen(false)} onSubmit={request}/>}
    </Shell>
  );
}
