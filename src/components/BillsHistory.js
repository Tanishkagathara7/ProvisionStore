import React, { useState, useEffect } from "react";
import {
  Receipt,
  Calendar,
  DollarSign,
  X,
  Eye,
  Filter,
  Download,
} from "lucide-react";
import { billsAPI, handleAPIError } from "../services/api";

const BillsHistory = ({ isOpen, onClose, user }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    page: 1,
    limit: 10,
  });
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalBills: 0,
    averageAmount: 0,
  });
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchBills();
    }
  }, [isOpen, user, filters]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await billsAPI.getAll(filters);

      if (response.success) {
        setBills(response.data);
        setStats(response.stats);
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "linear-gradient(135deg, #10b981, #059669)";
      case "draft":
        return "linear-gradient(135deg, #f59e0b, #d97706)";
      case "cancelled":
        return "linear-gradient(135deg, #ef4444, #dc2626)";
      default:
        return "linear-gradient(135deg, #6b7280, #4b5563)";
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBillDetailClose = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedBill(null);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "25px",
      padding: "30px",
      width: "100%",
      maxWidth: "1000px",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
      position: "relative",
    },
    closeButton: {
      position: "absolute",
      top: "20px",
      right: "20px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "none",
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "rgba(255, 255, 255, 0.8)",
      transition: "all 0.3s ease",
    },
    header: {
      textAlign: "center",
      marginBottom: "30px",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "10px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    statCard: {
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "15px",
      padding: "20px",
      textAlign: "center",
    },
    statNumber: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "white",
      marginBottom: "5px",
    },
    statLabel: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "0.9rem",
    },
    filters: {
      display: "flex",
      gap: "15px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    select: {
      padding: "10px 15px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "10px",
      color: "white",
      fontSize: "0.9rem",
    },
    billsList: {
      maxHeight: "400px",
      overflowY: "auto",
    },
    billItem: {
      background: "rgba(255, 255, 255, 0.05)",
      borderRadius: "15px",
      padding: "20px",
      marginBottom: "15px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      transition: "all 0.3s ease",
    },
    billInfo: {
      flex: 1,
    },
    billNumber: {
      fontSize: "1.1rem",
      fontWeight: "bold",
      color: "white",
      marginBottom: "5px",
    },
    billDate: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: "0.9rem",
      marginBottom: "5px",
    },
    billAmount: {
      fontSize: "1.3rem",
      fontWeight: "bold",
      color: "#06b6d4",
    },
    statusBadge: {
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      color: "white",
      textTransform: "capitalize",
    },
    actionButton: {
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      color: "white",
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      margin: "0 5px",
      transition: "all 0.3s ease",
    },
    billDetail: {
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "15px",
      padding: "20px",
      marginTop: "20px",
    },
    itemsTable: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "15px",
    },
    tableHeader: {
      background: "rgba(255, 255, 255, 0.1)",
      color: "white",
      padding: "12px",
      textAlign: "left",
      fontSize: "0.9rem",
      fontWeight: "bold",
    },
    tableCell: {
      padding: "12px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: "0.9rem",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "rgba(255, 255, 255, 0.7)",
    },
    error: {
      background: "rgba(239, 68, 68, 0.2)",
      color: "#ef4444",
      padding: "15px",
      borderRadius: "10px",
      marginBottom: "20px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.modal}>
        <button
          style={styles.closeButton}
          onClick={onClose}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
          }}
        >
          <X size={20} />
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>📋 Bills History</h2>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Statistics */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.totalBills}</div>
            <div style={styles.statLabel}>Total Bills</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {formatCurrency(stats.totalAmount)}
            </div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {formatCurrency(stats.averageAmount)}
            </div>
            <div style={styles.statLabel}>Average Bill</div>
          </div>
        </div>

        {/* Filters */}
        <div style={styles.filters}>
          <select
            style={styles.select}
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Bills List */}
        <div style={styles.billsList}>
          {loading ? (
            <div style={styles.emptyState}>
              <Receipt size={80} color="rgba(255, 255, 255, 0.3)" />
              <h3 style={{ fontSize: "1.5rem", margin: "20px 0 10px" }}>
                Loading bills...
              </h3>
            </div>
          ) : bills.length === 0 ? (
            <div style={styles.emptyState}>
              <Receipt size={80} color="rgba(255, 255, 255, 0.3)" />
              <h3 style={{ fontSize: "1.5rem", margin: "20px 0 10px" }}>
                No bills found
              </h3>
              <p>Create your first bill to see it here</p>
            </div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill._id}
                style={styles.billItem}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                }}
              >
                <div style={styles.billInfo}>
                  <div style={styles.billNumber}>
                    {bill.formattedBillNumber || bill.billNumber}
                  </div>
                  <div style={styles.billDate}>
                    <Calendar
                      size={14}
                      style={{ marginRight: "5px", verticalAlign: "middle" }}
                    />
                    {formatDate(bill.createdAt)}
                  </div>
                  <div style={styles.billAmount}>
                    <DollarSign
                      size={16}
                      style={{ marginRight: "5px", verticalAlign: "middle" }}
                    />
                    {formatCurrency(bill.totalAmount)}
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      ...styles.statusBadge,
                      background: getStatusColor(bill.status),
                    }}
                  >
                    {bill.status}
                  </span>
                  <button
                    style={styles.actionButton}
                    onClick={() => setSelectedBill(bill)}
                    onMouseOver={(e) => {
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Detail Modal */}
        {selectedBill && (
          <div style={styles.overlay} onClick={handleBillDetailClose}>
            <div
              style={{ ...styles.modal, maxWidth: "700px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                style={styles.closeButton}
                onClick={() => setSelectedBill(null)}
                onMouseOver={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.2)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }}
              >
                <X size={20} />
              </button>

              <div style={styles.header}>
                <h3 style={styles.title}>Bill Details</h3>
              </div>

              <div style={styles.billDetail}>
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ color: "white", marginBottom: "10px" }}>
                    {selectedBill.formattedBillNumber ||
                      selectedBill.billNumber}
                  </h4>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                      marginBottom: "5px",
                    }}
                  >
                    Date: {formatDate(selectedBill.createdAt)}
                  </p>
                  {selectedBill.customerName && (
                    <p
                      style={{
                        color: "rgba(255, 255, 255, 0.7)",
                        marginBottom: "5px",
                      }}
                    >
                      Customer: {selectedBill.customerName}
                    </p>
                  )}
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                      marginBottom: "5px",
                    }}
                  >
                    Payment: {selectedBill.paymentMethod}
                  </p>
                </div>

                <table style={styles.itemsTable}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Item</th>
                      <th style={styles.tableHeader}>Weight</th>
                      <th style={styles.tableHeader}>Price/Unit</th>
                      <th style={styles.tableHeader}>Qty</th>
                      <th style={styles.tableHeader}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBill.items.map((item, index) => (
                      <tr key={index}>
                        <td style={styles.tableCell}>{item.name}</td>
                        <td style={styles.tableCell}>
                          {item.weight} {item.weightUnit}
                        </td>
                        <td style={styles.tableCell}>
                          {formatCurrency(item.pricePerUnit)}
                        </td>
                        <td style={styles.tableCell}>{item.quantity}</td>
                        <td style={styles.tableCell}>
                          {formatCurrency(item.itemTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div
                  style={{
                    borderTop: "2px solid rgba(255, 255, 255, 0.2)",
                    paddingTop: "15px",
                    marginTop: "15px",
                    textAlign: "right",
                  }}
                >
                  <h3 style={{ color: "white", fontSize: "1.5rem" }}>
                    Total: {formatCurrency(selectedBill.totalAmount)}
                  </h3>
                </div>

                {selectedBill.notes && (
                  <div style={{ marginTop: "15px" }}>
                    <h5 style={{ color: "white", marginBottom: "5px" }}>
                      Notes:
                    </h5>
                    <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      {selectedBill.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillsHistory;
