import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

/**
 * GameLogin Page
 * 
 * Dedicated login portal for the Distribution Game Simulation.
 * Styled to match the rest of the Game Simulation screens (emerald/white theme).
 */
const GameLogin = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter all required fields");
      setLoading(false);
      return;
    }

    try {
      if (activeRole === "student") {
        // 1. Hardcoded test participant credentials
        if (email.toLowerCase() === "testgame45" && password === "testgame45") {
          const userName = "Sunshine Agency";

          // Check if user has already completed the game
          const { data: existingResult, error: checkError } = await supabase
            .from("user_game_results")
            .select("user_name")
            .eq("user_name", userName)
            .maybeSingle();

          if (existingResult) {
            setError("You have already completed the game simulation and cannot play again.");
            setLoading(false);
            return;
          }

          localStorage.setItem("token", "dummy-game-token-12345");
          localStorage.setItem("userRole", "student");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("simulation", "Distribution Simulation");
          localStorage.setItem("userName", userName);
          localStorage.setItem("userDegree", "Distribution Simulation");
          
          setLoading(false);
          navigate("/game-distribution/intro");
          return;
        }

        // 2. Query Supabase for dynamic participant credentials
        try {
          const { data: user, error: dbError } = await supabase
            .from("game_simulation_users")
            .select("*")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (dbError) throw dbError;

          if (user && user.password === password) {
            const userName = user.name || "Participant";

            // Check if user has already completed the game
            const { data: existingResult, error: checkError } = await supabase
              .from("user_game_results")
              .select("user_name")
              .eq("user_name", userName)
              .maybeSingle();

            if (existingResult) {
              setError("You have already completed the game simulation and cannot play again.");
              setLoading(false);
              return;
            }

            localStorage.setItem("token", `supabase-game-token-${user.id}`);
            localStorage.setItem("userRole", "student");
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("simulation", "Distribution Simulation");
            localStorage.setItem("userName", userName);
            localStorage.setItem("userDegree", "Distribution Simulation");
            
            setLoading(false);
            navigate("/game-distribution/intro");
            return;
          } else {
            setError("Invalid credentials for Distribution Simulation.");
            setLoading(false);
            return;
          }
        } catch (dbErr) {
          console.error("Supabase auth error:", dbErr);
          setError("Error connecting to database. Please make sure the 'game_simulation_users' table exists in Supabase.");
          setLoading(false);
          return;
        }
      } else if (activeRole === "admin") {
        // 3. Admin credentials bypass
        if (
          (email.toLowerCase() === "gamesimadmin" || email.toLowerCase() === "admin@123") && 
          password === "xaction@2025"
        ) {
          localStorage.setItem("token", "dummy-admin-token-12345");
          localStorage.setItem("userRole", "admin");
          localStorage.setItem("userEmail", email);
          localStorage.setItem("simulation", "Distribution Simulation");
          
          setLoading(false);
          navigate("/admin/game-results");
          return;
        } else {
          setError("Invalid admin credentials for Game Simulation.");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error("Game login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Strip */}
        <div className="bg-emerald-600 px-6 py-6 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Distribution Simulation Login
          </h1>
          <p className="text-emerald-100 text-sm mt-2">
            Enter your credentials to access the simulation
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600 text-sm font-medium">Error: {error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <select
                value={activeRole}
                onChange={(e) => {
                  setActiveRole(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={loading}
              >
                <option value="student">Participant</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {activeRole === "student" ? "Email Address" : "Username / Email"}
              </label>
              <input
                type={activeRole === "student" ? "email" : "text"}
                placeholder={activeRole === "student" ? "Enter your email" : "Enter admin username"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className={`w-full flex items-center justify-center py-3 px-4 rounded-lg shadow-lg transition-all transform mt-8 ${
                loading
                  ? "bg-emerald-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-xl"
              } text-white font-bold text-lg`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/game-simulation")}
              className="text-gray-500 hover:text-emerald-600 text-sm font-medium transition-colors"
            >
              ← Back to Simulations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLogin;
