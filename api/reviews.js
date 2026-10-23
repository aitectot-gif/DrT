// Vercel serverless function: returns the clinic's public Google reviews.
//
// Data source: Google Places API (New) — Place Details, "reviews" field.
// Google returns at most 5 reviews per place; full review history is not
// available through this API.
//
// Required Vercel environment variables (never commit these):
//   GOOGLE_PLACES_API_KEY  server-side key with "Places API (New)" enabled
//   GOOGLE_PLACE_ID        the clinic's Place ID (optional; if missing, the
//                          listing is looked up once by name + address)

const PLACES_BASE = "https://places.googleapis.com/v1";
const CLINIC_QUERY =
  "Dr. Thennarasu Multispeciality Clinic, 119 Katchery Street, Uthangarai, Krishnagiri, Tamil Nadu 635207";

// Kept per warm function instance so the name lookup runs at most once.
let resolvedPlaceId = null;

async function placesFetch(path, apiKey, fieldMask, init) {
  const res = await fetch(PLACES_BASE + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error("Places API " + res.status);
    err.detail = body.slice(0, 500);
    throw err;
  }
  return res.json();
}

async function getPlaceId(apiKey) {
  if (process.env.GOOGLE_PLACE_ID) return process.env.GOOGLE_PLACE_ID.trim();
  if (resolvedPlaceId) return resolvedPlaceId;

  const data = await placesFetch(
    "/places:searchText",
    apiKey,
    "places.id,places.displayName,places.formattedAddress",
    { method: "POST", body: JSON.stringify({ textQuery: CLINIC_QUERY, languageCode: "en" }) }
  );
  // Only accept a result that is actually the Uthangarai clinic.
  const match = (data.places || []).find(function (p) {
    const name = ((p.displayName && p.displayName.text) || "").toLowerCase();
    const address = (p.formattedAddress || "").toLowerCase();
    return name.includes("thennarasu") && address.includes("uthangarai");
  });
  if (!match) throw new Error("Clinic listing not found by text search");
  console.log("Resolved clinic Place ID:", match.id, "-", match.formattedAddress);
  resolvedPlaceId = match.id;
  return resolvedPlaceId;
}

function toReview(r) {
  const author = r.authorAttribution || {};
  // Prefer the reviewer's original wording over Google's translation.
  const text = (r.originalText && r.originalText.text) || (r.text && r.text.text) || "";
  return {
    author: author.displayName || "",
    authorUri: author.uri || "",
    photoUri: author.photoUri || "",
    rating: typeof r.rating === "number" ? r.rating : null,
    text: text,
    relativeTime: r.relativePublishTimeDescription || "",
    publishTime: r.publishTime || "",
    reviewUri: r.googleMapsUri || "",
  };
}

module.exports = async function handler(req, res) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    console.error("reviews: GOOGLE_PLACES_API_KEY is not set");
    res.setHeader("Cache-Control", "no-store");
    return res.status(503).json({ status: "unconfigured", reviews: [] });
  }

  try {
    const placeId = await getPlaceId(apiKey);
    const place = await placesFetch(
      "/places/" + encodeURIComponent(placeId) + "?languageCode=en",
      apiKey,
      "id,displayName,rating,userRatingCount,googleMapsUri,reviews"
    );

    const reviews = (place.reviews || []).map(toReview).filter(function (r) {
      return r.author && r.rating;
    });

    // Vercel's edge cache serves this for 12h, then refreshes in the background.
    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=86400");
    return res.status(200).json({
      status: "ok",
      place: {
        name: (place.displayName && place.displayName.text) || "",
        rating: typeof place.rating === "number" ? place.rating : null,
        userRatingCount: place.userRatingCount || 0,
        mapsUri: place.googleMapsUri || "",
      },
      reviews: reviews,
    });
  } catch (err) {
    // Technical detail stays in the server log; visitors get a generic state.
    console.error("reviews: fetch failed:", err.message, err.detail || "");
    res.setHeader("Cache-Control", "public, s-maxage=300");
    return res.status(502).json({ status: "error", reviews: [] });
  }
};
