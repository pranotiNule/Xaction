import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { API_BASE_URL, API_URL } from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeSimulation, setActiveSimulation] = useState(null);
  const [activeRole, setActiveRole] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get("role");
    const simParam = params.get("simulation");
    
    // Check if coming from simulation selection page
    if (simParam) {
      // Get simulation data from localStorage
      const savedSimulation = localStorage.getItem('selectedSimulation');
      if (savedSimulation) {
        try {
          const simData = JSON.parse(savedSimulation);
          setActiveSimulation(simData.degree || simData.name);
          
          // Pre-fill credentials if available
          if (simData.studentLogin) {
            setEmail(simData.studentLogin.email);
            setPassword(simData.studentLogin.password);
            setActiveRole('student');
          }
        } catch (error) {
          console.error('Error parsing simulation data:', error);
        }
      }
    } else if (roleParam) {
      // Legacy URL params support
      if (roleParam === "mba") setActiveSimulation("MBA");
      else if (roleParam === "be") setActiveSimulation("BE");
      else if (roleParam === "admin") setActiveSimulation("AdminPanel");
    }
  }, [location.search]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !activeRole || !activeSimulation) {
      setError("Please enter all required fields");
      setLoading(false);
      return;
    }

    try {
      // First check if server is accessible for all other logins
      try {
        await axios.options(API_BASE_URL);
      } catch (err) {
        if (err.code === 'ERR_NETWORK') {
          setError('Cannot connect to server. Please ensure the backend server is running.');
          setLoading(false);
          return;
        }
      }

      // Determine the correct endpoint based on role
      let endpoint;
      if (activeRole === "superadmin") {
        endpoint = `${API_URL}/superadmin/login`;
      } else if (activeRole === "admin") {
        endpoint = `${API_URL}/collegeadmin/login`;
      } else if (activeRole === "student") {
        endpoint = `${API_URL}/auth/login`;
      } else {
        setError("Invalid role selected");
        setLoading(false);
        return;
      }

      // Make the login request
      const loginResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email, 
          password,
          role: activeRole,
          simulation: activeSimulation,
          degree: activeSimulation // Send degree for access control
        })
      });

      const responseData = await loginResponse.json();

      if (loginResponse.ok && responseData.token) {
        // Store authentication data
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('userRole', activeRole);
        localStorage.setItem('userEmail', email);
        localStorage.setItem('simulation', activeSimulation);
        
        // Store user info for Socket.IO (REQUIRED for real-time features)
        if (responseData.user?._id) {
          localStorage.setItem('userId', responseData.user._id);
        }
        if (responseData.user?.college) {
          localStorage.setItem('college', responseData.user.college);
          localStorage.setItem('userCollege', responseData.user.college); // For Socket.IO
        }
        if (responseData.user?.fullName) {
          localStorage.setItem('userName', responseData.user.fullName);
        }
        if (responseData.user?.degree) {
          localStorage.setItem('userDegree', responseData.user.degree);
        } else if (activeSimulation) {
          // Store the simulation/degree even if not in user object
          localStorage.setItem('userDegree', activeSimulation);
        }
        
        // Navigate based on role (use standard routes without degree prefix)
        if (activeRole === 'superadmin') {
          navigate("/superadmin/dashboard");
        } else if (activeRole === 'admin') {
          navigate("/admin/dashboard");
        } else if (activeRole === 'student') {
          navigate("/student/dashboard");
        }
      } else {
        setError(responseData.details || responseData.message || "Login failed");
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please ensure the backend server is running.');
      } else if (err.response?.data?.details) {
        setError(err.response.data.details);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    const options = [<option key="default" value="">Select Role</option>];
    
    // Check if it's AdminPanel/Super Admin login
    if (activeSimulation === "AdminPanel") {
      options.push(
        <option key="superadmin" value="superadmin">Super Admin</option>
      );
    } else if (activeSimulation) {
      // For any simulation (MBA, BE, BTech, Law, etc.), show student and admin options
      options.push(
        <option key="student" value="student">Student</option>,
        <option key="admin" value="admin">College Admin</option>
      );
    }
    
    return options;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center text-indigo-600 mb-4">
          {activeSimulation ? `${activeSimulation} Login` : 'Login'}
        </h2>
        {!activeSimulation && (
          <div className="text-center mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-700 text-sm">
              Please select a simulation from the <a href="/simulation" className="text-blue-600 underline">simulation page</a>
            </p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            >
              {getRoleOptions()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full flex items-center justify-center py-2 px-4 rounded-md transition ${
              loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
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
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
