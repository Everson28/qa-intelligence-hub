const API_ROOT = import.meta.env.VITE_API_URL || window.location.origin.replace(":5173", ":8000");
const API_BASE = `${API_ROOT}/api/v1`;

export { API_ROOT, API_BASE };
