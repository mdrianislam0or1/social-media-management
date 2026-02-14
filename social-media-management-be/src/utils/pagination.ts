/**
 * Pagination utility for consistent pagination across all endpoints
 */

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IPaginationResult {
  skip: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Calculate pagination parameters
 * @param options - Pagination options from query params
 * @param total - Total number of documents
 * @returns Pagination result with skip, limit, and metadata
 */
export const calculatePagination = (
  options: IPaginationOptions,
  total: number,
): IPaginationResult => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  return {
    skip,
    limit,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Generate pagination metadata for API responses
 * @param page - Current page number
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination metadata object
 */
export const getPaginationMeta = (
  page: number,
  limit: number,
  total: number,
): IPaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse sort string into MongoDB sort object
 * @param sortBy - Sort field (prefix with - for descending)
 * @returns MongoDB sort object
 */
export const parseSortString = (sortBy?: string): Record<string, 1 | -1> => {
  if (!sortBy) {
    return { createdAt: -1 }; // Default sort by newest
  }

  const sortOrder = sortBy.startsWith('-') ? -1 : 1;
  const field = sortBy.startsWith('-') ? sortBy.substring(1) : sortBy;

  return { [field]: sortOrder };
};
