import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Support only game admin credentials
    if ((username === "admin@123" || username === "gamesimadmin") && password === "xaction@2025") {
      navigate("/admin/game-results");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-center">
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-green-100 text-sm mt-1">Please enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
              Error: {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            Login →
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full text-gray-500 text-sm font-medium hover:text-gray-700"
          >
            Go Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
