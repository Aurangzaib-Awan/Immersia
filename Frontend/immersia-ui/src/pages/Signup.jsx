import { useState } from "react";
import { Input } from "@/components/ui/input.jsx";
import { Label } from "@/components/ui/label.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/services/api"; // Adjust import path as needed

function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authAPI.register(form);
      console.log("Server response:", data);

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        // Also store user data if available in response
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        alert("Signup successful!");
        navigate("/skill");
      } else {
        alert("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Signup failed. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <section className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
        <h1 className="text-4xl font-bold text-center mb-6 text-white">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname" className="text-gray-300">Full Name *</Label>
            <Input
              id="fullname"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              required
              className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
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
              required
              className="bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-md"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>
        
        <div className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <a
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
            >
             Login
            </a>
        </div>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-2 text-gray-400">or</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        <Button
          variant="outline"
          className="w-full py-2 mt-2 text-gray-300 font-semibold rounded-lg border-gray-600 hover:bg-gray-700 hover:text-white transition-colors"
        >
          Sign up with Google
        </Button>
      </section>
    </main>
  );
}

export default Signup;