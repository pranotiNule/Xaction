import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

// Hardcoded admin credentials (only for game simulation admin panel)
const ADMIN_USERNAME = "gamesimadmin";
const ADMIN_PASSWORD = "xaction@2025";

// No localStorage helper needed. Supabase is used directly.

const GameSimulationAdminPanel = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Tab: "results" | "users"
  const [activeTab, setActiveTab] = useState("results");

  // User credential management
  const [users, setUsers] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newName, setNewName] = useState("");
  const [userFormError, setUserFormError] = useState("");
  const [userFormSuccess, setUserFormSuccess] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [revealIndex, setRevealIndex] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("game_simulation_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) {
        setUsers(data || []);
      } else {
        console.error("Error fetching users:", error.message);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
      await fetchUsers();
      fetchResults();
    } else {
      setLoginError("Invalid username or password.");
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("game_final_results")
      .select("*")
      .order("completed_at", { ascending: false });

    if (!error) {
      setResults(data || []);
    } else {
      console.error("Error fetching results:", error.message);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setResults([]);
    setUsers([]);
    setActiveTab("results");
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // ── User management handlers ──────────────────────────────────
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserFormError("");
    setUserFormSuccess("");

    if (!newName.trim()) { setUserFormError("Name is required."); return; }
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
      setUserFormError("A valid email is required."); return;
    }
    if (newPass.length < 6) {
      setUserFormError("Password must be at least 6 characters."); return;
    }

    try {
      // Check if user already exists
      const { data: existingUser, error: checkErr } = await supabase
        .from("game_simulation_users")
        .select("id")
        .eq("email", newEmail.trim().toLowerCase())
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existingUser) {
        setUserFormError("A user with this email already exists.");
        return;
      }

      // Insert new user into Supabase
      const { error: insertErr } = await supabase
        .from("game_simulation_users")
        .insert([{
          name: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          password: newPass
        }]);

      if (insertErr) throw insertErr;

      setNewName("");
      setNewEmail("");
      setNewPass("");
      setUserFormSuccess("User credentials created successfully!");
      fetchUsers();
      setTimeout(() => setUserFormSuccess(""), 3000);
    } catch (err) {
      console.error("Create user error:", err);
      setUserFormError("Failed to create user. Make sure table exists: " + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const { error } = await supabase
        .from("game_simulation_users")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Failed to delete user: " + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-white font-bold text-xl">Game Simulation Admin Panel</h1>
            <p className="text-emerald-100 text-sm">View all player results & manage user credentials</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-emerald-200 transition-colors text-2xl font-bold leading-none"
          >
            ✕
          </button>
        </div>

        {!isLoggedIn ? (
          /* ── LOGIN FORM ─────────────────────────────────────────── */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
                <p className="text-gray-500 text-sm mt-1">Enter credentials to access the panel</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 transition-colors pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    Error: {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Login →
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono">Esc</kbd> to close
              </p>
            </div>
          </div>
        ) : (
          /* ── DASHBOARD ──────────────────────────────────────────── */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex justify-between items-center px-6 py-3 border-b border-gray-100 bg-gray-50">
              {/* Tab switcher */}
              <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "results"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Game Results
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTab === "users"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Manage Users
                  {users.length > 0 && (
                    <span className="ml-1.5 bg-emerald-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {users.length}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex gap-2">
                {activeTab === "results" && (
                  <button
                    onClick={fetchResults}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-4 py-2 rounded-lg text-sm transition-colors border border-emerald-200"
                  >
                    Refresh
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-lg text-sm transition-colors border border-red-200"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* ── GAME RESULTS TAB ─────────────────────────────────── */}
            {activeTab === "results" && (
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-3 text-gray-600 text-sm font-medium">
                  Total Results: <span className="text-emerald-600 font-bold">{results.length}</span>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                      <p className="text-gray-500 font-medium">Loading results...</p>
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center text-gray-400">
                      <p className="text-4xl mb-3">📭</p>
                      <p className="font-semibold text-lg">No results yet</p>
                      <p className="text-sm">Players haven't completed the game yet</p>
                    </div>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-emerald-50 text-emerald-800">
                        <th className="text-left px-4 py-3 font-bold rounded-tl-lg border-b-2 border-emerald-200">#</th>
                        <th className="text-left px-4 py-3 font-bold border-b-2 border-emerald-200">User</th>
                        <th className="text-right px-4 py-3 font-bold border-b-2 border-emerald-200">Total Sales</th>
                        <th className="text-right px-4 py-3 font-bold border-b-2 border-emerald-200">ROI</th>
                        <th className="text-right px-4 py-3 font-bold border-b-2 border-emerald-200">Market Share</th>
                        <th className="text-center px-4 py-3 font-bold border-b-2 border-emerald-200">Satisfaction</th>
                        <th className="text-center px-4 py-3 font-bold border-b-2 border-emerald-200">Cash Flow</th>
                        <th className="text-left px-4 py-3 font-bold rounded-tr-lg border-b-2 border-emerald-200">Completed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((row, idx) => (
                        <tr
                          key={row.id}
                          className={`border-b border-gray-100 hover:bg-emerald-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                        >
                          <td className="px-4 py-3 font-bold text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-800">{row.user_name || "Guest"}</div>
                            <div className="text-xs text-gray-400 font-mono">{row.user_id}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">
                            ₹{Number(row.total_score || 0).toLocaleString("en-IN")}
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${Number(row.distributor_roi) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                            {Number(row.distributor_roi || 0).toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 font-medium">{row.market_share || "—"}%</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.retailer_satisfaction >= 2.5
                                ? "bg-emerald-100 text-emerald-700"
                                : row.retailer_satisfaction >= 1.5
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                              {Number(row.retailer_satisfaction || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.cash_flow_health === "Healthy"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                              }`}>
                              {row.cash_flow_health || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {row.completed_at
                              ? new Date(row.completed_at).toLocaleString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── MANAGE USERS TAB ─────────────────────────────────── */}
            {activeTab === "users" && (
              <div className="flex-1 overflow-auto p-4 space-y-6">

                {/* Create user form */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5">
                  <h2 className="text-base font-bold text-emerald-800 mb-4 flex items-center gap-2">
                    <span className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm">+</span>
                    Create User Credentials
                  </h2>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full px-3 py-2.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 text-sm bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                        >
                          {showNewPass ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    {/* Feedback & Submit */}
                    <div className="sm:col-span-3 flex flex-col sm:flex-row sm:items-center gap-3">
                      {userFormError && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex-1">
                          Error: {userFormError}
                        </p>
                      )}
                      {userFormSuccess && (
                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex-1">
                          Success: {userFormSuccess}
                        </p>
                      )}
                      {!userFormError && !userFormSuccess && <div className="flex-1" />}
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        Create User
                      </button>
                    </div>
                  </form>
                </div>

                {/* Users table */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700">
                      Created Users —{" "}
                      <span className="text-emerald-600">{users.length} total</span>
                    </h3>
                    <p className="text-xs text-gray-400 italic">
                      Credentials stored in Supabase database · Share with users
                    </p>
                  </div>

                  {users.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-center text-gray-400">
                      <div>
                        <p className="text-sm font-medium">No users created yet</p>
                        <p className="text-xs">Use the form above to add user credentials</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                            <th className="text-left px-5 py-3 font-semibold border-b border-gray-100">#</th>
                            <th className="text-left px-5 py-3 font-semibold border-b border-gray-100">Name</th>
                            <th className="text-left px-5 py-3 font-semibold border-b border-gray-100">Email</th>
                            <th className="text-left px-5 py-3 font-semibold border-b border-gray-100">Password</th>
                            <th className="text-left px-5 py-3 font-semibold border-b border-gray-100">Created</th>
                            <th className="text-center px-5 py-3 font-semibold border-b border-gray-100">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u, idx) => (
                            <tr
                              key={u.id}
                              className={`border-b border-gray-50 hover:bg-emerald-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                            >
                              <td className="px-5 py-3 text-gray-400 font-bold">{idx + 1}</td>
                              <td className="px-5 py-3 font-semibold text-gray-800">{u.name}</td>
                              <td className="px-5 py-3 font-mono text-gray-700 text-xs">{u.email}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-gray-800 text-xs bg-gray-100 px-2 py-1 rounded">
                                    {revealIndex === idx ? u.password : "•".repeat(Math.min(u.password.length, 10))}
                                  </span>
                                  <button
                                    onClick={() => setRevealIndex(revealIndex === idx ? null : idx)}
                                    className="text-gray-400 hover:text-emerald-600 transition-colors text-xs font-semibold"
                                    title={revealIndex === idx ? "Hide password" : "Show password"}
                                  >
                                    {revealIndex === idx ? "Hide" : "Show"}
                                  </button>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-xs text-gray-400">
                                {new Date(u.created_at || u.createdAt || new Date()).toLocaleDateString("en-IN", {
                                  day: "2-digit", month: "short", year: "numeric",
                                })}
                              </td>
                              <td className="px-5 py-3 text-center">
                                {deleteConfirm === u.id ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleDeleteUser(u.id)}
                                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(null)}
                                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded-lg font-semibold transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirm(u.id)}
                                    className="text-red-400 hover:text-red-600 transition-colors text-xs font-semibold"
                                    title="Delete user"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <p className="text-xs text-center text-gray-400">
                  Credentials are saved in the Supabase database.
                  Share these credentials with users to allow them to log in.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSimulationAdminPanel;
