import { useState } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "@/services/api";
import { AlertCircle, CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";

import { Link } from "react-router-dom";


function Signup({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/projects";
  
  // Debug: Log the routing state
  console.log('Signup - location.state:', location.state);
  console.log('Signup - from value:', from);
  
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

      // Server-managed session: success indicated by presence of user
      if (data && (data.user || data.email || data.id)) {
        // API already cached normalized user in sessionStorage
        // Just extract it from there for consistency  
        const cachedUser = JSON.parse(sessionStorage.getItem('user'));
        
        console.log('Signup Success - navigating to:', from);
        console.log('Signup Success - cached user:', cachedUser);
        
        setSuccessMessage("Account created successfully! Redirecting...");
        
        // Navigate to intended page BEFORE React batches the setState
        // This prevents GuestOnlyRoute from intercepting
        navigate(from, { replace: true });
        
        // Update app state AFTER navigation
        // This ensures routes re-evaluate with user available from sessionStorage
        setTimeout(() => {
          console.log('Signup - Setting user state after navigation');
          if (setUser) setUser(cachedUser);
        }, 0);
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
    <main className="flex justify-center items-center min-h-screen bg-[rgb(248,250,252)] py-8 px-4 sm:px-6">
      {/* Card with subtle border */}
      <div className="border border-[rgb(226,232,240)] rounded-xl w-full max-w-sm sm:max-w-md">
        <section className="w-full bg-white rounded-xl p-6 sm:p-8 relative">

          {/* Cancel Button - Top Right Corner */}
          <button
            onClick={handleCancel}
            disabled={loading}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[rgb(148,163,184)] hover:text-[rgb(15,23,42)] transition-colors duration-200 z-10 disabled:opacity-50"
            type="button"
            aria-label="Cancel and go back"
          >
            <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Header */}
          <div className="text-center mb-8 pt-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(37,99,235)] mb-2">
              Join Immersia
            </h1>
            <p className="text-[rgb(148,163,184)] text-sm sm:text-base">
              Create your account to start learning
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Server Error Message */}
          {serverError && !successMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm font-medium mb-1">Signup Error</p>
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="fullname" className="text-[rgb(71,85,105)] text-sm font-medium">Full Name *</Label>
                {errors.fullname && (
                  <span className="text-red-500 text-xs flex items-center">
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
                className={`w-full bg-white border rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 transition-all duration-300 ${errors.fullname
                  ? "border-red-400 focus:ring-red-400/30"
                  : "border-[rgb(226,232,240)] focus:ring-[rgb(37,99,235)]/30 focus:border-[rgb(37,99,235)]"
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
                <Label htmlFor="email" className="text-[rgb(71,85,105)] text-sm font-medium">Email *</Label>
                {errors.email && (
                  <span className="text-red-500 text-xs flex items-center">
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
                className={`w-full bg-white border rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 transition-all duration-300 ${errors.email
                  ? "border-red-400 focus:ring-red-400/30"
                  : "border-[rgb(226,232,240)] focus:ring-[rgb(37,99,235)]/30 focus:border-[rgb(37,99,235)]"
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
                <Label htmlFor="password" className="text-[rgb(71,85,105)] text-sm font-medium">Password *</Label>
                {errors.password && (
                  <span className="text-red-500 text-xs flex items-center">
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
                  className={`w-full bg-white border rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 transition-all duration-300 pr-12 ${errors.password
                    ? "border-red-400 focus:ring-red-400/30"
                    : "border-[rgb(226,232,240)] focus:ring-[rgb(37,99,235)]/30 focus:border-[rgb(37,99,235)]"
                    }`}
                  placeholder="Create a strong password"
                  disabled={loading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(148,163,184)] hover:text-[rgb(71,85,105)] transition-colors duration-200 disabled:opacity-50"
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
              <div className="bg-[rgb(241,245,249)] p-3 rounded-lg mt-2">
                <p className="text-[rgb(148,163,184)] text-xs mb-2">Password must contain:</p>
                <ul className="text-xs space-y-1">
                  <li className={`flex items-center ${form.password.length >= 8 ? 'text-green-600' : 'text-[rgb(148,163,184)]'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${form.password.length >= 8 ? 'bg-green-600' : 'bg-[rgb(226,232,240)]'}`} />
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(form.password) ? 'text-green-600' : 'text-[rgb(148,163,184)]'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(form.password) ? 'bg-green-600' : 'bg-[rgb(226,232,240)]'}`} />
                    One lowercase letter
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(form.password) ? 'text-green-600' : 'text-[rgb(148,163,184)]'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(form.password) ? 'bg-green-600' : 'bg-[rgb(226,232,240)]'}`} />
                    One uppercase letter
                  </li>
                  <li className={`flex items-center ${/\d/.test(form.password) ? 'text-green-600' : 'text-[rgb(148,163,184)]'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(form.password) ? 'bg-green-600' : 'bg-[rgb(226,232,240)]'}`} />
                    One number
                  </li>
                  <li className={`flex items-center ${/[@$!%*?&]/.test(form.password) ? 'text-green-600' : 'text-[rgb(148,163,184)]'}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[@$!%*?&]/.test(form.password) ? 'bg-green-600' : 'bg-[rgb(226,232,240)]'}`} />
                    One special character (@$!%*?&)
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[rgb(37,99,235)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[rgb(29,78,216)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
          <div className="text-center text-sm text-[rgb(148,163,184)] mt-6 pt-6 border-t border-[rgb(226,232,240)]">
            Already have an account?{" "}
            <Link
              to="/login"
              state={location.state?.from ? { from: location.state.from } : undefined}
              className="font-semibold text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] hover:underline transition-colors duration-300"
            >
              Sign in
            </Link>
          </div>


        </section>
      </div>

    </main>
  );
}

export default Signup;