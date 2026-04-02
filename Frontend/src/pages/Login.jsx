import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "@/services/api";
import { XCircle } from "lucide-react";




function Login({ setUser }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    // Get the return URL from location state (undefined if none)
    const from = location.state?.from?.pathname;
    
    // Debug logging
    console.log('Login - location.state:', location.state);
    console.log('Login - from value:', from);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (error) setError("");
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleClose = () => {
        // If there was a previous page, go back; otherwise go home
        if (location.state?.from) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await authAPI.login(form.email, form.password);

            // Server-managed session: success indicated by presence of user
            if (data && data.user) {
                // API already cached normalized user in sessionStorage
                const cachedUser = JSON.parse(sessionStorage.getItem('user'));

                // Enhanced role-based redirection - navigate BEFORE state update
                const redirectPath = (() => {
                  if (cachedUser.is_admin) {
                    return "/admin";
                  } else if (cachedUser.is_hr) {
                    return from || "/talent";
                  } else if (cachedUser.is_mentor) {
                    return from || "/mentor-dashboard";
                  } else {
                    return from || "/projects";
                  }
                })();
                
                navigate(redirectPath, { replace: true });
                
                // Update app state AFTER navigation
                setTimeout(() => {
                  if (setUser) setUser(cachedUser);
                }, 0);
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);

            // Handle different error types from backend
            if (err.response) {
                const errorDetail = err.response.data?.detail;
                if (errorDetail === "User not found") {
                    setError("No account found with this email address.");
                } else if (errorDetail === "Invalid password") {
                    setError("Incorrect password. Please try again.");
                } else if (errorDetail?.includes("duplicate") || errorDetail?.includes("already exists")) {
                    setError("An account with this email already exists.");
                } else {
                    setError(errorDetail || "Something went wrong. Please try again.");
                }
            } else if (err.message?.includes("Network Error")) {
                setError("Network error. Please check your connection and try again.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };



    return (
        <main className="flex justify-center items-center min-h-screen bg-[rgb(248,250,252)] py-8 px-4 sm:px-6">
            <div className="border border-[rgb(226,232,240)] rounded-xl w-full max-w-sm sm:max-w-md">
                <div className="bg-white rounded-xl p-6 sm:p-8 relative">

                    {/* Cancel Button - Top Right Corner */}
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[rgb(148,163,184)] hover:text-[rgb(15,23,42)] transition-colors duration-200 z-10 disabled:opacity-50"
                        type="button"
                        aria-label="Cancel and go back"
                    >
                        <XCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                    </button>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-[rgb(37,99,235)] mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-[rgb(148,163,184)] text-sm sm:text-base">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-[rgb(71,85,105)] text-sm font-medium">Email Address *</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(37,99,235)]/30 focus:border-[rgb(37,99,235)] transition-all duration-300"
                                placeholder="Enter your email"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Password Field with Eye Icon */}
                        <div className="space-y-3">
                            <Label htmlFor="password" className="text-[rgb(71,85,105)] text-sm font-medium">Password *</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-[rgb(226,232,240)] rounded-lg px-4 py-3 text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(37,99,235)]/30 focus:border-[rgb(37,99,235)] transition-all duration-300 pr-12"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(148,163,184)] hover:text-[rgb(71,85,105)] transition-colors duration-200"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
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
                                    Signing In...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        {/* Signup Link */}
                        <div className="text-center text-sm text-[rgb(148,163,184)] mt-6 pt-6 border-t border-[rgb(226,232,240)]">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                state={location.state?.from ? { from: location.state.from } : undefined}
                                className="font-semibold text-[rgb(37,99,235)] hover:text-[rgb(29,78,216)] hover:underline transition-colors duration-300"
                            >
                                Create one
                            </Link>
                        </div>
                    </form>

                </div>

            </div>
        </main>
    );
}

export default Login;