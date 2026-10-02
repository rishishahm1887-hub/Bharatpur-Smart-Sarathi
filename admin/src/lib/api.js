const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


export const apiRequest = async (
    endpoint,
    options = {},
    getToken
) => {
    const token =
        getToken
            ? await getToken()
            : null;


    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                ...(options.body
                    ? {
                        "Content-Type":
                            "application/json",
                    }
                    : {}),

                ...(token
                    ? {
                        Authorization:
                            `Bearer ${token}`,
                    }
                    : {}),

                ...(options.headers || {}),
            },
        }
    );


    let data = {};

    try {
        data =
            await response.json();
    } catch {
        data = {};
    }


    if (!response.ok) {
        throw new Error(
            data.error ||
            data.message ||
            "Request failed."
        );
    }


    return data;
};


export const getDashboard =
    async (getToken) => {
        return apiRequest(
            "/admin/dashboard",
            {},
            getToken
        );
    };