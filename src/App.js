import React, { useState, useEffect } from "react";
import {
  Plus,
  Package,
  IndianRupee,
  Edit2,
  Trash2,
  Search,
  Scale,
  ShoppingCart,
  Receipt,
  History,
} from "lucide-react";
import BillsHistory from "./components/BillsHistory";
import { productsAPI, billsAPI, handleAPIError } from "./services/api";

const ProvisionStore = () => {
  const [showBillsHistory, setShowBillsHistory] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cart, setCart] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    pricePerUnit: "",
    weight: "",
    weightUnit: "kg",
    category: "",
  });

  const categories = [
    "Grains",
    "Pulses",
    "Spices",
    "Oil & Ghee",
    "Beverages",
    "Sweeteners",
    "Dairy",
    "Snacks",
    "Others",
  ];
  const weightUnits = ["kg", "gm"];

  // Load products from database on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await productsAPI.getAll();
        if (response.success) {
          setProducts(
            response.data.map((product) => ({
              ...product,
              id: product._id, // Map MongoDB _id to id for compatibility
            })),
          );
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Database not available. Using local storage mode.");
        // Fallback to default products if database is not available
        const defaultProducts = [
          {
            id: 1,
            name: "Rice (Basmati)",
            pricePerUnit: 120,
            weight: 1,
            weightUnit: "kg",
            category: "Grains",
          },
          {
            id: 2,
            name: "Wheat Flour",
            pricePerUnit: 45,
            weight: 1,
            weightUnit: "kg",
            category: "Grains",
          },
          {
            id: 3,
            name: "Sugar",
            pricePerUnit: 55,
            weight: 1,
            weightUnit: "kg",
            category: "Sweeteners",
          },
          {
            id: 4,
            name: "Tea Powder",
            pricePerUnit: 500,
            weight: 500,
            weightUnit: "gm",
            category: "Beverages",
          },
        ];
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Empty dependency array - only run once

  // Fetch products from database
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await productsAPI.getAll();
      if (response.success) {
        setProducts(
          response.data.map((product) => ({
            ...product,
            id: product._id, // Map MongoDB _id to id for compatibility
          })),
        );
      }
    } catch (err) {
      setError("Database error: " + handleAPIError(err));
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatWeight = (weight, unit) => {
    return `${weight} ${unit}`;
  };

  const calculatePrice = (pricePerUnit, weight, weightUnit) => {
    if (weightUnit === "gm") {
      return (pricePerUnit * weight) / 1000; // Convert gm to kg for calculation
    }
    return pricePerUnit * weight;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.pricePerUnit || !formData.weight) {
      alert("Please fill all required fields");
      return;
    }

    const productData = {
      name: formData.name,
      pricePerUnit: parseFloat(formData.pricePerUnit),
      weight: parseFloat(formData.weight),
      weightUnit: formData.weightUnit,
      category: formData.category || "Others",
    };

    try {
      setLoading(true);
      setError("");

      if (editingProduct) {
        await productsAPI.update(
          editingProduct._id || editingProduct.id,
          productData,
        );
        setEditingProduct(null);
      } else {
        await productsAPI.create(productData);
      }

      // Refresh products list from database
      await fetchProducts();

      setFormData({
        name: "",
        pricePerUnit: "",
        weight: "",
        weightUnit: "kg",
        category: "",
      });
      setShowAddForm(false);
    } catch (err) {
      console.error("Database error, falling back to local mode:", err);

      // Fallback to local state management if database fails
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((product) =>
            product.id === editingProduct.id
              ? { ...productData, id: editingProduct.id }
              : product,
          ),
        );
        setEditingProduct(null);
      } else {
        const newProduct = {
          ...productData,
          id: Date.now(),
        };
        setProducts((prev) => [...prev, newProduct]);
      }

      setFormData({
        name: "",
        pricePerUnit: "",
        weight: "",
        weightUnit: "kg",
        category: "",
      });
      setShowAddForm(false);
      setError("Database unavailable. Product saved locally.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      pricePerUnit: product.pricePerUnit.toString(),
      weight: product.weight.toString(),
      weightUnit: product.weightUnit,
      category: product.category,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        setLoading(true);
        setError("");
        await productsAPI.delete(id);
        await fetchProducts(); // Refresh the list from database
      } catch (err) {
        console.error("Database error, falling back to local mode:", err);

        // Fallback to local state management if database fails
        setProducts((prev) => prev.filter((product) => product.id !== id));
        setError("Database unavailable. Product deleted locally.");
      } finally {
        setLoading(false);
      }
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    }
  };

  const updateCartItemWeight = (id, weight) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, weight: parseFloat(weight) || 0 } : item,
      ),
    );
  };

  const updateCartItemPrice = (id, pricePerUnit) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, pricePerUnit: parseFloat(pricePerUnit) || 0 }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const cartTotal = cart.reduce((sum, item) => {
    const itemPrice = calculatePrice(
      item.pricePerUnit,
      item.weight,
      item.weightUnit,
    );
    return sum + itemPrice * item.quantity;
  }, 0);

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    maxWidth: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    glassCard: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "20px",
      padding: "30px",
      marginBottom: "30px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "20px",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
    },
    headerRight: {
      display: "flex",
      gap: "15px",
    },
    iconBox: {
      padding: "15px",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      borderRadius: "15px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "5px",
    },
    subtitle: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: "1.1rem",
    },
    button: {
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      color: "white",
      border: "none",
      padding: "15px 30px",
      borderRadius: "15px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      transition: "all 0.3s ease",
      boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "25px",
      marginBottom: "30px",
    },
    statCard: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "20px",
      padding: "25px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.3s ease",
    },
    statNumber: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      color: "white",
      marginTop: "5px",
    },
    statLabel: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "0.9rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
      fontWeight: "500",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "20px",
    },
    weightContainer: {
      display: "flex",
      gap: "10px",
    },
    input: {
      width: "100%",
      padding: "15px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "12px",
      color: "white",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    weightInput: {
      flex: "2",
      padding: "15px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "12px",
      color: "white",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    weightUnitSelect: {
      flex: "1",
      padding: "15px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "12px",
      color: "white",
      fontSize: "1rem",
      transition: "all 0.3s ease",
    },
    label: {
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.9rem",
      fontWeight: "500",
      marginBottom: "8px",
      display: "block",
    },
    searchContainer: {
      position: "relative",
      marginBottom: "30px",
    },
    searchInput: {
      width: "100%",
      padding: "15px 15px 15px 50px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "12px",
      color: "white",
      fontSize: "1.1rem",
      transition: "all 0.3s ease",
    },
    searchIcon: {
      position: "absolute",
      left: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "rgba(255, 255, 255, 0.6)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      background: "rgba(255, 255, 255, 0.05)",
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "bold",
      padding: "20px",
      textAlign: "left",
      fontSize: "0.9rem",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
    tableCell: {
      padding: "20px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      color: "white",
      fontSize: "1rem",
    },
    tableRow: {
      transition: "all 0.3s ease",
    },
    badge: {
      padding: "8px 16px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      color: "white",
    },
    weightBadge: {
      padding: "6px 12px",
      borderRadius: "15px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      color: "white",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
    },
    actionButton: {
      padding: "10px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      margin: "0 5px",
      transition: "all 0.3s ease",
      color: "white",
    },
    cartItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px",
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "10px",
      marginBottom: "10px",
    },
    quantityControl: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    quantityButton: {
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      border: "none",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cartInput: {
      width: "80px",
      padding: "8px 12px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "8px",
      color: "white",
      fontSize: "0.9rem",
      textAlign: "center",
      transition: "all 0.3s ease",
    },
    cartItemDetails: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      minWidth: "300px",
    },
    cartItemControls: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      alignItems: "flex-end",
    },
    cartEditRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "0.9rem",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "rgba(255, 255, 255, 0.7)",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.glassCard}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconBox}>
                <Package size={40} color="white" />
              </div>
              <div>
                <h1 style={styles.title}>Provision Store</h1>
                <p style={styles.subtitle}>Price & Billing Management</p>
              </div>
            </div>
            <div style={styles.headerRight}>
              <button
                style={{
                  ...styles.button,
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                }}
                onClick={() => setShowBillsHistory(true)}
              >
                <History size={24} />
                Bills History
              </button>
              <button
                style={{
                  ...styles.button,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
                onClick={() => setShowBilling(!showBilling)}
              >
                <ShoppingCart size={24} />
                Cart ({cart.length})
              </button>
              <button
                style={styles.button}
                onClick={() => {
                  setShowAddForm(true);
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    pricePerUnit: "",
                    weight: "",
                    weightUnit: "kg",
                    category: "",
                  });
                }}
              >
                <Plus size={24} />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              ...styles.glassCard,
              background: "rgba(239, 68, 68, 0.2)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#ef4444",
              textAlign: "center",
              padding: "20px",
            }}
          >
            ⚠️ {error}
            {error.includes("database") && (
              <div style={{ marginTop: "10px", fontSize: "0.9rem" }}>
                💡 Need help? Check the setup guide or start MongoDB server.
              </div>
            )}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div
            style={{
              ...styles.glassCard,
              background: "rgba(6, 182, 212, 0.2)",
              borderColor: "rgba(6, 182, 212, 0.3)",
              color: "#06b6d4",
              textAlign: "center",
              padding: "20px",
            }}
          >
            🔄 Loading...
          </div>
        )}

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Total Products</div>
              <div style={styles.statNumber}>{products.length}</div>
            </div>
            <div
              style={{
                ...styles.iconBox,
                background: "linear-gradient(135deg, #10b981, #059669)",
              }}
            >
              <Package size={32} color="white" />
            </div>
          </div>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Cart Items</div>
              <div style={styles.statNumber}>{cart.length}</div>
            </div>
            <div
              style={{
                ...styles.iconBox,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
              }}
            >
              <ShoppingCart size={32} color="white" />
            </div>
          </div>
          <div style={styles.statCard}>
            <div>
              <div style={styles.statLabel}>Cart Total</div>
              <div style={styles.statNumber}>₹{cartTotal.toFixed(2)}</div>
            </div>
            <div
              style={{
                ...styles.iconBox,
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
              }}
            >
              <IndianRupee size={32} color="white" />
            </div>
          </div>
        </div>

        {/* Billing Section */}
        {showBilling && (
          <div style={styles.glassCard}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h2 style={{ ...styles.title, fontSize: "2rem", margin: "0" }}>
                🧾 Billing Cart
              </h2>
              <button
                onClick={clearCart}
                style={{
                  ...styles.button,
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                }}
              >
                Clear Cart
              </button>
            </div>
            {cart.length === 0 ? (
              <div style={styles.emptyState}>
                <ShoppingCart size={80} color="rgba(255, 255, 255, 0.3)" />
                <h3 style={{ fontSize: "1.5rem", margin: "20px 0 10px" }}>
                  Cart is empty
                </h3>
                <p>Add products to start billing</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.id} style={styles.cartItem}>
                    <div style={styles.cartItemDetails}>
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                        {item.name}
                      </div>
                      <div style={styles.cartEditRow}>
                        <span
                          style={{
                            color: "rgba(255, 255, 255, 0.7)",
                            minWidth: "60px",
                          }}
                        >
                          Weight:
                        </span>
                        <input
                          type="number"
                          value={item.weight}
                          onChange={(e) =>
                            updateCartItemWeight(item.id, e.target.value)
                          }
                          style={styles.cartInput}
                          step="0.01"
                          min="0"
                        />
                        <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          {item.weightUnit}
                        </span>
                      </div>
                      <div style={styles.cartEditRow}>
                        <span
                          style={{
                            color: "rgba(255, 255, 255, 0.7)",
                            minWidth: "60px",
                          }}
                        >
                          Price/Unit:
                        </span>
                        <span style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                          ₹
                        </span>
                        <input
                          type="number"
                          value={item.pricePerUnit}
                          onChange={(e) =>
                            updateCartItemPrice(item.id, e.target.value)
                          }
                          style={styles.cartInput}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div
                        style={{
                          color: "rgba(255, 255, 255, 0.8)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Unit Total: ₹
                        {calculatePrice(
                          item.pricePerUnit,
                          item.weight,
                          item.weightUnit,
                        ).toFixed(2)}
                      </div>
                    </div>
                    <div style={styles.cartItemControls}>
                      <div style={styles.quantityControl}>
                        <button
                          style={styles.quantityButton}
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <span
                          style={{
                            fontWeight: "bold",
                            minWidth: "30px",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          style={styles.quantityButton}
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                          marginTop: "10px",
                        }}
                      >
                        ₹
                        {(
                          calculatePrice(
                            item.pricePerUnit,
                            item.weight,
                            item.weightUnit,
                          ) * item.quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    borderTop: "2px solid rgba(255, 255, 255, 0.2)",
                    paddingTop: "20px",
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h3
                    style={{ color: "white", fontSize: "1.5rem", margin: "0" }}
                  >
                    Total Amount
                  </h3>
                  <h3 style={{ color: "white", fontSize: "2rem", margin: "0" }}>
                    ₹{cartTotal.toFixed(2)}
                  </h3>
                </div>
                <button
                  style={{
                    ...styles.button,
                    width: "100%",
                    marginTop: "20px",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                  }}
                  onClick={() => {
                    alert(
                      `Bill Generated!\nTotal Amount: ₹${cartTotal.toFixed(2)}\nItems: ${cart.length}`,
                    );
                    clearCart();
                  }}
                >
                  <Receipt size={24} />
                  Generate Bill
                </button>
              </>
            )}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={styles.glassCard}>
            <h2
              style={{
                ...styles.title,
                fontSize: "2rem",
                marginBottom: "25px",
              }}
            >
              {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label style={styles.label}>Price per Unit (₹) *</label>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter price per unit"
                  step="0.01"
                />
              </div>
              <div>
                <label style={styles.label}>Weight *</label>
                <div style={styles.weightContainer}>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    style={styles.weightInput}
                    placeholder="Enter weight"
                    step="0.01"
                  />
                  <select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleInputChange}
                    style={styles.weightUnitSelect}
                  >
                    {weightUnits.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                        style={{ background: "#1f2937", color: "white" }}
                      >
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={styles.label}>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={styles.input}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                      style={{ background: "#1f2937", color: "white" }}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
              <button
                onClick={handleSubmit}
                style={{
                  ...styles.button,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                }}
              >
                {editingProduct ? "✅ Update" : "🚀 Add Product"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                  setFormData({
                    name: "",
                    pricePerUnit: "",
                    weight: "",
                    weightUnit: "kg",
                    category: "",
                  });
                }}
                style={{
                  ...styles.button,
                  background: "linear-gradient(135deg, #6b7280, #4b5563)",
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={styles.glassCard}>
          <div style={styles.searchContainer}>
            <Search size={24} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="🔍 Search products or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Products Table */}
        <div style={styles.glassCard}>
          <h2
            style={{ ...styles.title, fontSize: "2rem", marginBottom: "25px" }}
          >
            🏪 Product Catalog
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>Product</th>
                  <th style={styles.tableHeader}>Category</th>
                  <th style={styles.tableHeader}>Weight</th>
                  <th style={styles.tableHeader}>Price/Unit</th>
                  <th style={styles.tableHeader}>Total Value</th>
                  <th style={styles.tableHeader}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    style={styles.tableRow}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={styles.tableCell}>
                      <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>
                        {product.name}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            "linear-gradient(135deg, #8b5cf6, #a855f7)",
                        }}
                      >
                        {product.category}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.weightBadge}>
                        <Scale size={14} />
                        {formatWeight(product.weight, product.weightUnit)}
                      </span>
                    </td>
                    <td
                      style={{
                        ...styles.tableCell,
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      ₹{product.pricePerUnit}
                    </td>
                    <td
                      style={{
                        ...styles.tableCell,
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      ₹
                      {calculatePrice(
                        product.pricePerUnit,
                        product.weight,
                        product.weightUnit,
                      ).toFixed(2)}
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => addToCart(product)}
                        style={{
                          ...styles.actionButton,
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <ShoppingCart size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        style={{
                          ...styles.actionButton,
                          background:
                            "linear-gradient(135deg, #3b82f6, #2563eb)",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        style={{
                          ...styles.actionButton,
                          background:
                            "linear-gradient(135deg, #ef4444, #dc2626)",
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "scale(1.1)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "scale(1)";
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div style={styles.emptyState}>
              <Package size={80} color="rgba(255, 255, 255, 0.3)" />
              <h3 style={{ fontSize: "1.5rem", margin: "20px 0 10px" }}>
                No products found
              </h3>
              <p>Try searching for a different term</p>
            </div>
          )}
        </div>

        {/* Bills History Modal */}
        <BillsHistory
          isOpen={showBillsHistory}
          onClose={() => setShowBillsHistory(false)}
          user={null}
        />
      </div>
    </div>
  );
};
export default ProvisionStore;
