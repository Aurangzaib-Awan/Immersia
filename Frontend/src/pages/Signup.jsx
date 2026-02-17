import { useState } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/services/api";
import { AlertCircle, CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";

import { Link } from "react-router-dom";


function Signup({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: ""
  });

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Full name validation
    if (!form.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    } else if (form.fullname.trim().length < 2) {
      newErrors.fullname = "Full name must be at least 2 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Clear server error when user modifies any field
    if (serverError) {
      setServerError("");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.register(form);
      console.log("Server response:", data);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          if (setUser) setUser(data.user);
        }

        setSuccessMessage("Account created successfully! Redirecting...");

        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          navigate("/skill");
        }, 2000);

      } else {
        setServerError("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);

      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        const { status, data } = err.response;

        switch (status) {
          case 409:
            setErrors({
              email: "This email is already registered. Please use a different email or try logging in."
            });
            setServerError("An account with this email already exists.");
            break;

          case 400:
            if (data.errors) {
              // Handle validation errors from server
              const serverErrors = {};
              data.errors.forEach(error => {
                if (error.field === 'email') serverErrors.email = error.message;
                if (error.field === 'password') serverErrors.password = error.message;
                if (error.field === 'fullname') serverErrors.fullname = error.message;
              });
              setErrors(serverErrors);
            } else if (data.message) {
              setServerError(data.message);
            } else {
              setServerError("Invalid form data. Please check your inputs.");
            }
            break;

          case 422:
            setServerError("Validation failed. Please check your information.");
            if (data.errors) {
              const serverErrors = {};
              data.errors.forEach(error => {
                serverErrors[error.field] = error.message;
              });
              setErrors(serverErrors);
            }
            break;

          case 500:
            setServerError("Server error. Please try again later.");
            break;

          case 429:
            setServerError("Too many requests. Please try again in a few minutes.");
            break;

          default:
            setServerError(data?.message || "An unexpected error occurred. Please try again.");
        }
      } else if (err.request) {
        // Request was made but no response received
        setServerError("Network error. Please check your connection and try again.");
      } else {
        // Something else happened
        setServerError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle cancel/back navigation
  const handleCancel = () => {
    navigate(-1);
  };



  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 py-8 px-4 sm:px-6">
      {/* Moving Gradient Border */}
      <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full max-w-sm sm:max-w-md">
        <section className="w-full bg-surface-800 rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-800 relative">

          {/* Cancel Button - Top Right Corner */}
          <button
            onClick={handleCancel}
            disabled={loading}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors duration-200 z-10 disabled:opacity-50"
            type="button"
            aria-label="Cancel and go back"
          >
            <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Header with Flowing Gradient Text */}
          <div className="text-center mb-8 pt-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
              Join Immersia
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Create your account to start learning
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700 rounded-lg flex items-center space-x-3 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-300 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Server Error Message */}
          {serverError && !successMessage && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg flex items-start space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-sm font-medium mb-1">Signup Error</p>
                <p className="text-red-300/80 text-sm">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="fullname" className="text-gray-300 text-sm font-medium">Full Name *</Label>
                {errors.fullname && (
                  <span className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.fullname}
                  </span>
                )}
              </div>
              <Input
                id="fullname"
                name="fullname"
                value={form.fullname}
                onChange={handleChange}
                required
                className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.fullname
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-sky-500 focus:border-transparent"
                  }`}
                placeholder="Enter your full name"
                disabled={loading}
                aria-invalid={!!errors.fullname}
                aria-describedby={errors.fullname ? "fullname-error" : undefined}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email *</Label>
                {errors.email && (
                  <span className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </span>
                )}
              </div>
              <Input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-600 focus:ring-sky-500 focus:border-transparent"
                  }`}
                placeholder="Enter your email"
                disabled={loading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password *</Label>
                {errors.password && (
                  <span className="text-red-400 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.password}
                  </span>
                )}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-600 focus:ring-sky-500 focus:border-transparent"
                    }`}
                  placeholder="Create a strong password"
                  disabled={loading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200 disabled:opacity-50"
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-900/50 p-3 rounded-lg mt-2">
                <p className="text-gray-400 text-xs mb-2">Password must contain:</p>
                <ul className="text-xs space-y-1">
                  <li className={`flex items-center ${form.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${form.password.length >= 8 ? 'bg-green-400' : 'bg-gray-600'}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(form.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One lowercase letter
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(form.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center ${/\d/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(form.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One number
                  </li>
                  <li className={`flex items-center ${/[@$!%*?&]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[@$!%*?&]/.test(form.password) ? 'bg-green-400' : 'bg-gray-600'}`} />
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-400 mt-6 pt-6 border-t border-gray-700">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-300"
            >
              Sign in
            </Link>
          </div>


        </section>
      </div>

      {/* Add the gradient animation keyframes */}
      <style>{`
        @keyframes gradient-flow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-gradient-flow {
          animation: gradient-flow 3s ease infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

export default Signup;