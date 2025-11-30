import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "@/services/api";

function Login({ setUser }) {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the return URL from location state
    const from = location.state?.from?.pathname || "/";
    console.log("Return URL from state:", from);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authAPI.login(form.email, form.password);
            console.log("Login response:", data);
            
            if (data.token && data.user) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                if (setUser) {
                    setUser(data.user);
                }

                console.log("User role:", data.user.role);
                console.log("User is_admin:", data.user.is_admin);
                console.log("User is_hr:", data.user.is_hr);

                // FIXED: Proper role-based redirection
                if (data.user.is_admin) {
                    // Admin users go to admin dashboard
                    console.log("Redirecting admin to /admin");
                    navigate("/admin");
                } else if (data.user.is_hr) {
                    // HR users go to talent section or return URL
                    if (from && from !== "/") {
                        console.log("Redirecting HR to return URL:", from);
                        navigate(from);
                    } else {
                        console.log("Redirecting HR to /talent");
                        navigate("/talent");
                    }
                } else {
                    // Normal users (students, mentors) go to skills section or return URL
                    if (from && from !== "/") {
                        console.log("Redirecting normal user to return URL:", from);
                        navigate(from);
                    } else {
                        console.log("Redirecting normal user to /skill");
                        navigate("/skill");
                    }
                }
            } else {
                alert("Login failed. Check your credentials.");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-surface-900 to-gray-900 py-8 px-4 sm:px-6">
            <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow w-full max-w-sm sm:max-w-md">
                <section className="w-full bg-surface-800 rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-800">
                    
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-sky-400 via-blue-600 to-sky-400 bg-[length:200%_100%] animate-gradient-flow text-transparent bg-clip-text mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Sign in to continue your journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-3">
                            <Label htmlFor="email" className="text-gray-300 text-sm font-medium">Email Address *</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your email"
                                disabled={loading}
                                required
                            />
                        </div>

                        {/* Password Field with Eye Icon */}
                        <div className="space-y-3">
                            <Label htmlFor="password" className="text-gray-300 text-sm font-medium">Password *</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 pr-12"
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200"
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
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
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
                    </form>

                    {/* Rest of your login component remains the same */}
                    <div className="flex items-center my-6">
                        <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                        <span className="mx-4 text-gray-500 text-sm">or continue with</span>
                        <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    </div>

                    <Button
                        variant="outline"
                        disabled={loading}
                        className="w-full py-3 text-gray-300 font-semibold rounded-lg border border-gray-600 hover:bg-gray-700 hover:text-white hover:border-gray-500 transition-all duration-300 disabled:opacity-50 text-base"
                    >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="CurrentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </Button>

                    <div className="text-center text-sm text-gray-400 mt-6 pt-6 border-t border-gray-700">
                        Don't have an account?{" "}
                        <a
                            href="/signup"
                            className="font-semibold text-sky-400 hover:text-sky-300 hover:underline transition-colors duration-300"
                        >
                            Create account
                        </a>
                    </div>

                    <div className="text-center mt-4">
                        <a
                            href="/forgot-password"
                            className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-300"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Login;