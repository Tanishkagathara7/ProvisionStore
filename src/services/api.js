const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Token management
const getToken = () => localStorage.getItem("provisionStoreToken");
const setToken = (token) => localStorage.setItem("provisionStoreToken", token);
const removeToken = () => localStorage.removeItem("provisionStoreToken");

// API call helper
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);

    // Handle token expiration
    if (
      error.message.includes("token") ||
      error.message.includes("unauthorized")
    ) {
      removeToken();
      window.location.reload();
    }

    throw error;
  }
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.token) {
      setToken(response.token);
    }

    return response;
  },

  // Register user
  register: async (name, email, password) => {
    const response = await apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (response.success && response.token) {
      setToken(response.token);
    }

    return response;
  },

  // Logout user
  logout: () => {
    removeToken();
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!getToken();
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;
    return await apiCall(endpoint);
  },

  // Create new product
  create: async (productData) => {
    return await apiCall("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  },

  // Update product
  update: async (id, productData) => {
    return await apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  },

  // Delete product
  delete: async (id) => {
    return await apiCall(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Get categories
  getCategories: async () => {
    return await apiCall("/products/categories");
  },
};

// Bills API
export const billsAPI = {
  // Get all bills
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/bills${queryString ? `?${queryString}` : ""}`;
    return await apiCall(endpoint);
  },

  // Create new bill
  create: async (billData) => {
    return await apiCall("/bills", {
      method: "POST",
      body: JSON.stringify(billData),
    });
  },

  // Get specific bill
  getById: async (id) => {
    return await apiCall(`/bills/${id}`);
  },

  // Update bill status
  updateStatus: async (id, status) => {
    return await apiCall(`/bills/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return await apiCall("/bills/stats/dashboard");
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return await apiCall("/health");
  },
};

// Error handling helper
export const handleAPIError = (error) => {
  console.error("API Error:", error);

  if (error.message.includes("fetch")) {
    return "Network error. Please check your connection.";
  }

  if (
    error.message.includes("token") ||
    error.message.includes("unauthorized")
  ) {
    return "Session expired. Please login again.";
  }

  return error.message || "An unexpected error occurred.";
};

// Export token management for external use
export { getToken, setToken, removeToken };
