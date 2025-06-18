import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  UserPlus,
  LogIn,
} from "lucide-react";

const LoginSignup = ({ isOpen, onClose, onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isLoginMode && !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!isLoginMode) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Simulate authentication
      const userData = {
        name: formData.name || formData.email.split("@")[0],
        email: formData.email,
      };

      onLogin(userData);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      onClose();
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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
      padding: "40px",
      width: "100%",
      maxWidth: "450px",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.2)",
      position: "relative",
      animation: "modalSlideIn 0.3s ease-out",
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
    iconContainer: {
      width: "80px",
      height: "80px",
      margin: "0 auto 20px",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 15px 30px rgba(6, 182, 212, 0.3)",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "bold",
      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "8px",
    },
    subtitle: {
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: "1rem",
      marginBottom: "10px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    inputGroup: {
      position: "relative",
    },
    inputWithIcon: {
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    inputIcon: {
      position: "absolute",
      left: "15px",
      color: "rgba(255, 255, 255, 0.6)",
      zIndex: 1,
    },
    input: {
      width: "100%",
      padding: "15px 15px 15px 50px",
      background: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "15px",
      color: "white",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
    },
    inputError: {
      borderColor: "rgba(239, 68, 68, 0.8)",
      background: "rgba(239, 68, 68, 0.1)",
    },
    inputFocus: {
      borderColor: "rgba(6, 182, 212, 0.8)",
      background: "rgba(6, 182, 212, 0.1)",
      boxShadow: "0 0 0 3px rgba(6, 182, 212, 0.1)",
    },
    passwordToggle: {
      position: "absolute",
      right: "15px",
      background: "none",
      border: "none",
      color: "rgba(255, 255, 255, 0.6)",
      cursor: "pointer",
      padding: "5px",
      borderRadius: "5px",
      transition: "all 0.3s ease",
    },
    error: {
      color: "#ef4444",
      fontSize: "0.875rem",
      marginTop: "5px",
      display: "flex",
      alignItems: "center",
      gap: "5px",
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
      justifyContent: "center",
      gap: "10px",
      transition: "all 0.3s ease",
      boxShadow: "0 10px 25px rgba(6, 182, 212, 0.3)",
      marginTop: "10px",
    },
    switchMode: {
      textAlign: "center",
      marginTop: "25px",
      color: "rgba(255, 255, 255, 0.8)",
    },
    switchLink: {
      color: "#06b6d4",
      textDecoration: "none",
      fontWeight: "600",
      cursor: "pointer",
      transition: "color 0.3s ease",
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
            e.target.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.color = "rgba(255, 255, 255, 0.8)";
          }}
        >
          <X size={20} />
        </button>

        <div style={styles.header}>
          <div style={styles.iconContainer}>
            {isLoginMode ? (
              <LogIn size={36} color="white" />
            ) : (
              <UserPlus size={36} color="white" />
            )}
          </div>
          <h2 style={styles.title}>
            {isLoginMode ? "Welcome Back!" : "Join Us Today!"}
          </h2>
          <p style={styles.subtitle}>
            {isLoginMode
              ? "Sign in to access your provision store account"
              : "Create your account to get started"}
          </p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <div style={styles.inputWithIcon}>
                <User size={20} style={styles.inputIcon} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(errors.name ? styles.inputError : {}),
                  }}
                  onFocus={(e) => {
                    if (!errors.name) {
                      Object.assign(e.target.style, styles.inputFocus);
                    }
                  }}
                  onBlur={(e) => {
                    Object.assign(e.target.style, styles.input);
                    if (errors.name) {
                      Object.assign(e.target.style, styles.inputError);
                    }
                  }}
                />
              </div>
              {errors.name && <div style={styles.error}>⚠️ {errors.name}</div>}
            </div>
          )}

          <div style={styles.inputGroup}>
            <div style={styles.inputWithIcon}>
              <Mail size={20} style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.email ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  if (!errors.email) {
                    Object.assign(e.target.style, styles.inputFocus);
                  }
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, styles.input);
                  if (errors.email) {
                    Object.assign(e.target.style, styles.inputError);
                  }
                }}
              />
            </div>
            {errors.email && <div style={styles.error}>⚠️ {errors.email}</div>}
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWithIcon}>
              <Lock size={20} style={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {}),
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    Object.assign(e.target.style, styles.inputFocus);
                  }
                }}
                onBlur={(e) => {
                  Object.assign(e.target.style, styles.input);
                  if (errors.password) {
                    Object.assign(e.target.style, styles.inputError);
                  }
                }}
              />
              <button
                type="button"
                style={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                onMouseOver={(e) => {
                  e.target.style.color = "white";
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }}
                onMouseOut={(e) => {
                  e.target.style.color = "rgba(255, 255, 255, 0.6)";
                  e.target.style.background = "none";
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div style={styles.error}>⚠️ {errors.password}</div>
            )}
          </div>

          {!isLoginMode && (
            <div style={styles.inputGroup}>
              <div style={styles.inputWithIcon}>
                <Lock size={20} style={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  style={{
                    ...styles.input,
                    ...(errors.confirmPassword ? styles.inputError : {}),
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) {
                      Object.assign(e.target.style, styles.inputFocus);
                    }
                  }}
                  onBlur={(e) => {
                    Object.assign(e.target.style, styles.input);
                    if (errors.confirmPassword) {
                      Object.assign(e.target.style, styles.inputError);
                    }
                  }}
                />
                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  onMouseOver={(e) => {
                    e.target.style.color = "white";
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.color = "rgba(255, 255, 255, 0.6)";
                    e.target.style.background = "none";
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <div style={styles.error}>⚠️ {errors.confirmPassword}</div>
              )}
            </div>
          )}

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 15px 35px rgba(6, 182, 212, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 25px rgba(6, 182, 212, 0.3)";
            }}
          >
            {isLoginMode ? <LogIn size={20} /> : <UserPlus size={20} />}
            {isLoginMode ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div style={styles.switchMode}>
          {isLoginMode
            ? "Don't have an account? "
            : "Already have an account? "}
          <span
            style={styles.switchLink}
            onClick={toggleMode}
            onMouseOver={(e) => {
              e.target.style.color = "#0891b2";
            }}
            onMouseOut={(e) => {
              e.target.style.color = "#06b6d4";
            }}
          >
            {isLoginMode ? "Sign up here" : "Sign in here"}
          </span>
        </div>
      </div>

      <style>
        {`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-50px) scale(0.9);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoginSignup;
