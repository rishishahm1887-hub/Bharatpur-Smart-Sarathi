const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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


export const getPlaces = () => {
  return apiRequest("/places");
};


export const resolvePlace = (name, token) => {
  return apiRequest("/places/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name }),
  });
};


export const addMyTrip = (placeId, token) => {
  return apiRequest("/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ placeId }),
  });
};


export const getMyTrips = (token) => {
  return apiRequest("/trips", { headers: { Authorization: `Bearer ${token}` } });
};


export const removeMyTrip = (placeId, token) => {
  if (!placeId) {
    throw new Error("Place ID is required.");
  }

  return apiRequest(`/trips/${placeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};



export const clearMyTrips = (token) => {
  return apiRequest("/trips", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
};



export const getTripReviews = (token) => {
  return apiRequest("/reviews", { headers: { Authorization: `Bearer ${token}` } });
};



export const getPublicTripReviews = (placeId) => {
  const endpoint = placeId
    ? `/reviews/public?placeId=${encodeURIComponent(placeId)}`
    : "/reviews/public";
  return apiRequest(endpoint);
};



export const submitTripReview = (tripId, rating, review, token, reviewerName) => {
  return apiRequest("/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tripId, rating, review, reviewerName }),
  });
};



export const deleteTripReview = (placeId, token) => {
  return apiRequest(`/reviews/${placeId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
};



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