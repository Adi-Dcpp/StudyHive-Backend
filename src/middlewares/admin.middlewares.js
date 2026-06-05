import { ApiError } from '../utils/api-error.utils.js';

const verifyAdmin = (req, res, next) => {
    if(!req.user) {
        throw new ApiError(401, 'Unauthorized: No user information found');
    }

    if(!req.user.role || req.user.role !== 'admin') {
        throw new ApiError(403, 'Forbidden: Admin access required');
    }

    next();
}

export { verifyAdmin };