import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./game-simulation/supabaseClient";

const GameSimulationResults = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("results");

  // ── Results state ──────────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── User-management state ──────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [formOk, setFormOk] = useState("");
  const [revealId, setRevealId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { 
    fetchResults(); 
    fetchUsers();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("game_final_results")
        .select("*")
        .order("completed_at", { ascending: false });
      if (!error) setResults(data || []);
      else console.error("Error fetching results:", error.message);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("game_simulation_users")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setUsers(data || []);
      else console.error("Error fetching users:", error.message);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErr(""); setFormOk("");
    if (!newName.trim()) { setFormErr("Name is required."); return; }
    if (!newEmail.trim() || !/\S+@\S+\.\S+/.test(newEmail)) {
      setFormErr("A valid email is required."); return;
    }
    if (newPass.length < 6) { setFormErr("Password must be at least 6 characters."); return; }
    
    try {
      // Check if user already exists
      const { data: existingUser, error: checkErr } = await supabase
        .from("game_simulation_users")
        .select("id")
        .eq("email", newEmail.trim().toLowerCase())
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existingUser) {
        setFormErr("This email already exists.");
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

      setNewName(""); setNewEmail(""); setNewPass("");
      setFormOk("User created successfully!");
      fetchUsers();
      setTimeout(() => setFormOk(""), 3000);
    } catch (err) {
      console.error("Create user error:", err);
      setFormErr("Failed to create user. Make sure table exists: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from("game_simulation_users")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Failed to delete user: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Game Simulation Admin</h1>
            <p className="text-gray-600 text-sm mt-1">Manage users and view player results</p>
          </div>
          <div className="flex gap-3">
            {activeTab === "results" && (
              <button
                onClick={fetchResults}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
              >
                Refresh
              </button>
            )}
            <button
              onClick={() => navigate("/game-simulation")}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-6 w-fit">
          <button
            onClick={() => setActiveTab("results")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "results"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Game Results
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "users"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manage Users
            {users.length > 0 && (
              <span className="ml-2 bg-emerald-500 text-white text-xs rounded-full px-2 py-0.5">
                {users.length}
              </span>
            )}
          </button>
        </div>

        {/* ── GAME RESULTS TAB ───────────────────────────────────── */}
        {activeTab === "results" && (
          loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-500 font-medium">Fetching latest scores...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-emerald-600 text-white">
                      <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Player</th>
                      <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Total Sales</th>
                      <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">ROI</th>
                      <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-center">Satisfaction</th>
                      <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-center">Cash Flow</th>
                      <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Completed At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">
                          No results found. Students haven't completed the simulation yet.
                        </td>
                      </tr>
                    ) : (
                      results.map((row) => (
                        <tr key={row.id} className="hover:bg-emerald-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{row.user_id || "Guest"}</div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-700">
                            ₹{Number(row.total_score || 0).toLocaleString("en-IN")}
                          </td>
                          <td className={`px-6 py-4 text-right font-bold ${Number(row.distributor_roi) >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {Number(row.distributor_roi || 0).toFixed(2)}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              row.retailer_satisfaction >= 2.5 ? "bg-green-100 text-green-700"
                              : row.retailer_satisfaction >= 1.5 ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                            }`}>
                              {Number(row.retailer_satisfaction || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              row.cash_flow_health === "Healthy" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                            }`}>
                              {row.cash_flow_health || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {row.completed_at
                              ? new Date(row.completed_at).toLocaleString("en-IN", {
                                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* ── MANAGE USERS TAB ───────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="space-y-6">

            {/* Create User Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">+</span>
                Create User Credentials
              </h2>
              <form onSubmit={handleCreateUser}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 text-sm transition-colors"
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="user@example.com"
                      className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 text-sm transition-colors"
                    />
                  </div>
                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full px-4 py-2.5 pr-10 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-800 text-sm transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                      >
                        {showNewPass ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback + Submit */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {formErr && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg flex-1">
                      Error: {formErr}
                    </p>
                  )}
                  {formOk && (
                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex-1">
                      Success: {formOk}
                    </p>
                  )}
                  {!formErr && !formOk && <div className="flex-1" />}
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700">
                  Created Users —{" "}
                  <span className="text-emerald-600">{users.length} total</span>
                </h3>
                <p className="text-xs text-gray-400 italic">
                  Stored in Supabase database · Share credentials with users
                </p>
              </div>

              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <p className="font-semibold">No users created yet</p>
                  <p className="text-sm">Use the form above to add user credentials</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="px-6 py-3 font-semibold">#</th>
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold">Password</th>
                        <th className="px-6 py-3 font-semibold">Created</th>
                        <th className="px-6 py-3 font-semibold text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u, idx) => (
                        <tr key={u.id} className={`hover:bg-emerald-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                          <td className="px-6 py-3 text-gray-400 font-bold">{idx + 1}</td>
                          <td className="px-6 py-3 font-semibold text-gray-800">{u.name}</td>
                          <td className="px-6 py-3 font-mono text-gray-600 text-xs">{u.email}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-gray-800 text-xs bg-gray-100 px-2 py-1 rounded">
                                {revealId === u.id ? u.password : "•".repeat(Math.min(u.password.length, 10))}
                              </span>
                              <button
                                onClick={() => setRevealId(revealId === u.id ? null : u.id)}
                                className="text-gray-400 hover:text-emerald-600 transition-colors text-xs font-semibold"
                                title={revealId === u.id ? "Hide" : "Show"}
                              >
                                {revealId === u.id ? "Hide" : "Show"}
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-400">
                            {new Date(u.created_at || u.createdAt || new Date()).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-3 text-center">
                            {deleteId === u.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleDelete(u.id)}
                                  className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-semibold transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteId(null)}
                                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded-lg font-semibold transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteId(u.id)}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSimulationResults;
