export const notFound = (
    req,
    res
) => {
    res.status(404).json({
        success: false,
        error: "API endpoint not found.",
    });
};

export const errorHandler = (
    error,
    req,
    res,
    next
) => {
    console.error(error);

    const status =
        error.statusCode ||
        error.status ||
        500;

    res.status(status).json({
        success: false,
        error:
            process.env.NODE_ENV ===
            "production"
                ? "Internal server error."
                : error.message,
    });
};