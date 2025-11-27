import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/services/api"; // Your auth API service

function Login({ setUser }) {  // ✅ Accept setUser prop
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authAPI.login(form.email, form.password);
            
            console.log("Server response:", data);

            if (data.token && data.user) {
                // Save token and user data
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                console.log("Login successful - Token:", data.token);
                
                // 🎯 UPDATE: Call setUser prop to update global state
                if (setUser) {
                    setUser(data.user);
                }
                
                // Redirect based on admin role
                if (data.user.is_admin) {
                    navigate("/admin");
                } else {
                    navigate("/skill");
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
        <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
            <section className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                
                <h1 className="text-4xl font-bold text-center mb-6 text-white">
                    Log In
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email *</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">Password *</Label>
                        <Input
                            type="password"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
                            disabled={loading}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </Button>
                </form>

                <div className="flex items-center my-4">
                    <hr className="flex-grow border-gray-600" />
                    <span className="mx-2 text-gray-400">or</span>
                    <hr className="flex-grow border-gray-600" />
                </div>

                <Button
                    variant="outline"
                    disabled={loading}
                    className="w-full py-2 mt-2 text-gray-300 font-semibold rounded-lg border-gray-600 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                >
                    Sign in with Google
                </Button>

                <div className="text-center text-sm text-gray-400 mt-4">
                    Don't have an account?{" "}
                    <a
                        href="/signup"
                        className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                    >
                        Sign up
                    </a>
                </div>
            </section>
        </main>
    );
}

export default Login;