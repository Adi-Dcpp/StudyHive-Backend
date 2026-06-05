import { paginationDefaults } from "./constants.utils.js";  

const parsePositiveInteger = (value, fallback) => {
	const parsed = Number.parseInt(value, 10);

	if (!Number.isFinite(parsed) || parsed < 1) {
		return fallback;
	}

	return parsed;
};

export const getPaginatedData = ({ query = {}, total = 0 } = {}) => {
	const parsedPage = parsePositiveInteger(
		query.page,
		paginationDefaults.DEFAULT_PAGE
	);

	const parsedLimit = parsePositiveInteger(
		query.limit,
		paginationDefaults.DEFAULT_LIMIT
	);

	const page = Math.min(parsedPage, paginationDefaults.MAX_PAGE);
	const limit = Math.min(parsedLimit, paginationDefaults.MAX_LIMIT);

	const safeTotal = Number.isFinite(total) && total >= 0 ? total : 0;

	const totalPages = Math.ceil(safeTotal / limit);

	const skip = (page - 1) * limit;

	return {
		page,
		limit,
		skip,
		pagination: {
			total: safeTotal,
			page,
			limit,
			totalPages,
			hasNextPage: page < totalPages,
			hasPrevPage: page > 1,
		},
	};
};