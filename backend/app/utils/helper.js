/** Capitalize first letter of string; trim. Used for product/category/subcategory names. */
export const capitalizeFirst = (val) => {
    if (val == null || typeof val !== 'string') return val;
    const s = String(val).trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

export const handleResponse = (res, statusCode, message, data = {}) => {
  const success = statusCode >= 200 && statusCode < 300;

  const sanitize = (item) => {
    if (!item) return item;
    const obj = item.toObject?.() || item;
    const { password, __v, ...cleaned } = obj;
    return cleaned;
  };

  const sanitizedData = Array.isArray(data)
    ? data.map(sanitize)
    : sanitize(data);

  const responsePayload = {
    success,
    error: !success,
    message,
  };

  if (Array.isArray(sanitizedData)) {
    responsePayload.results = sanitizedData;
  } else {
    responsePayload.result = sanitizedData;
  }

  return res.status(statusCode).json(responsePayload);
};

export default handleResponse;