/**
 * Standard API response helpers
 */

export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
}

export function errorResponse(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const body = {
        success: false,
        message,
    };
    if (errors) body.errors = errors;
    return res.status(statusCode).json(body);
}

export function paginatedResponse(res, data, page, limit, total) {
    return res.status(200).json({
        success: true,
        message: 'Success',
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}
