import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GameSimulationAdminPanel from "./game-simulation/GameSimulationAdminPanel";

/**
 * Game Simulation Page
 * 
 * Displays available game-based simulations.
 * Each simulation card navigates to the login page for that simulation.
 */
const GameSimulation = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Ctrl + Shift + A opens the admin panel card
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setShowAdminCard((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [showAdminCard, setShowAdminCard] = useState(false);
  const handleAdminLoginRedirect = () => {
    navigate("/admin/login");
  };

  const gameSimulations = [
    {
      id: "game-distribution",
      name: "Distribution Simulation",
      description:
        "Master the art of supply chain and distribution management. Make strategic decisions on inventory, logistics, warehousing, and channel management to maximize profitability and customer satisfaction.",
      icon: "🚚",
      color: "emerald",
      duration: "4-6 weeks",
      level: "Intermediate",
      participants: "10-30",
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      emerald: {
        bg: "bg-emerald-50",
        hover: "hover:bg-emerald-100",
        border: "border-emerald-300",
        text: "text-emerald-700",
        badge: "bg-emerald-200",
        gradient: "from-emerald-500 to-teal-600",
      },
    };
    return colorMap[color] || colorMap.emerald;
  };

  const getLevelColor = (level) => {
    const levelMap = {
      Beginner: "bg-green-100 text-green-700",
      Intermediate: "bg-blue-100 text-blue-700",
      Advanced: "bg-purple-100 text-purple-700",
    };
    return levelMap[level] || levelMap.Intermediate;
  };

  const handleSimulationClick = (simulation) => {
    // Store selected game simulation in localStorage
    localStorage.setItem(
      "selectedSimulation",
      JSON.stringify({
        id: simulation.id,
        name: simulation.name,
        type: "game",
      })
    );
    // Navigate to dedicated game login page
    navigate("/game-login");
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
        {/* Admin Panel Card - Fixed in bottom-right corner */}
        {showAdminCard && (
          <div
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 p-4 rounded-xl shadow-2xl w-64 sm:w-72 transition-all duration-300"
            style={{ animation: 'fadeIn 0.3s ease-in-out' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                Admin
              </span>
              <div className="text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-green-700 mb-2">Admin Panel</h2>
            <p className="text-gray-600 text-xs mb-4">Manage simulations, quizzes, and analytics.</p>
            
            <button 
              onClick={handleAdminLoginRedirect}
              className="w-full text-green-700 font-semibold py-2 px-3 rounded-lg border-2 border-green-300 hover:bg-green-100 transition-colors text-sm"
            >
              Admin Login →
            </button>
          </div>
        )}
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6">
              🎮 Game Simulations
            </h1>
            <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto text-emerald-100">
              Experience immersive game-based learning with interactive
              scenarios, real-time challenges, and strategic decision making.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm sm:text-base">
                🕹️ Interactive Gameplay
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm sm:text-base">
                🧠 Strategic Thinking
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm sm:text-base">
                🏆 Competitive Learning
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulations Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {gameSimulations.map((simulation) => {
            const colors = getColorClasses(simulation.color);
            const isHovered = hoveredCard === simulation.id;

            return (
              <div
                key={simulation.id}
                onClick={() => handleSimulationClick(simulation)}
                onMouseEnter={() => setHoveredCard(simulation.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`cursor-pointer ${colors.bg} ${colors.hover} border-2 ${colors.border} transition-all duration-300 p-5 sm:p-6 rounded-xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 relative overflow-hidden`}
              >
                {/* Icon Circle */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-3xl sm:text-4xl mb-4 shadow-lg transform transition-transform duration-300 ${isHovered ? "scale-110 rotate-12" : ""}`}
                >
                  {simulation.icon}
                </div>

                {/* Title */}
                <h2
                  className={`text-xl sm:text-2xl font-bold ${colors.text} mb-3`}
                >
                  {simulation.name}
                </h2>

                {/* Description */}
                <p className="text-gray-700 text-sm sm:text-base mb-4 line-clamp-3">
                  {simulation.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className={`${getLevelColor(simulation.level)} px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {simulation.level}
                  </span>
                  <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ⏱️ {simulation.duration}
                  </span>
                </div>

                {/* Participants Info */}
                <div className="flex items-center text-gray-600 text-sm mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>{simulation.participants} participants</span>
                </div>

                {/* Action Button */}
                <button
                  className={`w-full ${colors.text} font-semibold py-3 px-4 rounded-lg border-2 ${colors.border} ${colors.hover} transition-all duration-300 text-sm sm:text-base ${isHovered ? "transform scale-105" : ""}`}
                >
                  Enter Simulation →
                </button>

                {/* Decorative corner element */}
                <div
                  className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full transform transition-all duration-500 ${isHovered ? "scale-150" : "scale-100"}`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Back to Simulations */}
        <div className="text-center mt-8 sm:mt-12">
          <button
            onClick={() => navigate("/")}
            className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm sm:text-base inline-flex items-center transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>


    {/* Game Simulation Admin Panel - opens with Ctrl+Shift+A */}
    {showAdminPanel && (
      <GameSimulationAdminPanel onClose={() => setShowAdminPanel(false)} />
    )}
  </>
  );
};

export default GameSimulation;
