const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Handle API requests in one place
const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, options);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `Request failed with status ${response.status}`,
    );
  }

  return data;
};


// Public places
export const getPlaces = () => {
  return apiRequest("/places");
};


// Find or resolve a place using Google Places
export const resolvePlace = (name, token) => {
  return apiRequest("/places/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
};


// Add a place to My Trips
export const addMyTrip = (placeId, token) => {
  return apiRequest("/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ placeId }),
  });
};


// Get saved trips
export const getMyTrips = (token) => {
  return apiRequest("/trips", { headers: { Authorization: `Bearer ${token}` } });
};


// Remove one saved trip
export const removeMyTrip = (placeId, token) => {
  if (!placeId) {
    throw new Error("Place ID is required.");
  }

  return apiRequest(`/trips/${placeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};


// Remove all saved trips
export const clearMyTrips = (token) => {
  return apiRequest("/trips", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
};


// Get the current user's reviews
export const getTripReviews = (token) => {
  return apiRequest("/reviews", { headers: { Authorization: `Bearer ${token}` } });
};


// Get public reviews
export const getPublicTripReviews = () => {
  return apiRequest("/reviews/public");
};


// Submit a review
export const submitTripReview = (tripId, rating, review, token, reviewerName) => {
  return apiRequest("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tripId, rating, review, reviewerName }),
  });
};


// Delete a review
export const deleteTripReview = (placeId, token) => {
  return apiRequest(`/reviews/${placeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};


// Send a message to the AI assistant
export const sendAIChat = (message, history = [], token = null) => {
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return apiRequest("/ai/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ message, history }),
  });
};
