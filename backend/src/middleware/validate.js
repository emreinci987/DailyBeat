import { errorResponse } from '../utils/apiResponse.js';

/**
 * Express middleware factory — validates req.body against a Joi schema.
 * Usage: router.post('/path', validate(myJoiSchema), controller)
 */
export default function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((d) => d.message);
            return errorResponse(res, 'Doğrulama hatası', 400, messages);
        }

        req.body = value; // use cleaned value
        return next();
    };
}
