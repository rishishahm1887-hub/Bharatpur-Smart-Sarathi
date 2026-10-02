const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getPlaces = async () => {
  const response = await fetch(`${API_URL}/places`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const resolvePlace = async (name, token) => {
  const response = await fetch(`${API_URL}/places/resolve`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      name: name,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const addMyTrip = async (placeId, token) => {
  const response = await fetch(`${API_URL}/trips`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      placeId: placeId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const getMyTrips = async (token) => {
  const response = await fetch(`${API_URL}/trips`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const removeMyTrip = async (placeId, token) => {
  if (!placeId) {
    throw new Error("Place ID is required.");
  }

  const response = await fetch(`${API_URL}/trips/${placeId}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const clearMyTrips = async (token) => {
  const response = await fetch(`${API_URL}/trips`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const getTripReviews = async (token) => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const getPublicTripReviews = async () => {
  const response = await fetch(`${API_URL}/reviews/public`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const submitTripReview = async (tripId, rating, review, token, reviewerName) => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      tripId: tripId,
      rating: rating,
      review: review,
      reviewerName: reviewerName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const deleteTripReview = async (placeId, token) => {
  const response = await fetch(`${API_URL}/reviews/${placeId}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};

export const sendAIChat = async (message, history = [], token = null) => {
  const headers = {
    "Content-Type": "application/json",
  };

  // Add Authorization header only when the user has a token
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",

    headers: headers,

    body: JSON.stringify({
      message: message,
      history: history,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`,
    );
  }

  return data;
};
