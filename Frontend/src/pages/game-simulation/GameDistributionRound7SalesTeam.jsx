import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound7SalesTeam = () => {
  const navigate = useNavigate();

  const [salesTeamAvailable] = useState(() => {
    const saved = localStorage.getItem("gameDistributionSalesTeam");
    return saved !== null ? parseInt(saved, 10) : 5;
  });

  // Always start from 0 (fresh slate for each round visit)
  const [retailersToVisit, setRetailersToVisit] = useState(0);
  const [newRetailerEffort, setNewRetailerEffort] = useState(0);
  const [schemePushIntensity, setSchemePushIntensity] = useState(0);

  const levelLabels = ["Low", "Medium", "High"];

  const totalCoverage = 2050; 
  const totalManpower = retailersToVisit > 0
    ? Math.round(totalCoverage / retailersToVisit)
    : 0;

  useEffect(() => {
    localStorage.setItem("gameDistributionR7RetailersToVisit", retailersToVisit.toString());
    localStorage.setItem("gameDistributionR7NewRetailerEffort", newRetailerEffort.toString());
    localStorage.setItem("gameDistributionR7SchemePushIntensity", schemePushIntensity.toString());
  }, [retailersToVisit, newRetailerEffort, schemePushIntensity]);

  const handleOK = () => {
    navigate("/game-distribution/round7-supply-discipline");
  };

  const handleBack = () => {
    navigate("/game-distribution/round7-credit-control");
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit?")) {
      navigate("/game-simulation");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      
      {/* Main Game Container */}
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        {/* Header */}
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm">
            Round 7 – Sales Team Deployment
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12">
          
          {/* Description */}
          <div className="text-center mb-4">
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Push for secondary sales to liquidate the forced inventory and protect your ROI.
            </p>
          </div>

          <div className="text-center mb-10">
            <p className="text-md text-gray-600 italic">
              Strategic deployment is critical to maximize this rare market opening.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center max-w-2xl mx-auto space-y-6">
            
            {/* Retailers to Visit per Salesperson */}
            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Retailers to Visit per Salesperson:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setRetailersToVisit(prev => Math.max(0, prev - 10))}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    −
                  </button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[100px] text-center">
                    {retailersToVisit}
                  </span>
                  <button
                    onClick={() => setRetailersToVisit(prev => prev + 10)}
                    className="bg-green-100 hover:bg-green-200 text-green-700 font-bold w-12 h-12 rounded-xl border-2 border-green-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-600 font-bold text-right text-lg">Retailers</p>
              </div>
            </div>

            {/* New Retailer Acquisition Effort */}
            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-3">New Retailer Acquisition Effort:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setNewRetailerEffort(prev => Math.max(0, prev - 1))}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    −
                  </button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[100px] text-center">
                    {levelLabels[newRetailerEffort]}
                  </span>
                  <button
                    onClick={() => setNewRetailerEffort(prev => Math.min(2, prev + 1))}
                    className="bg-green-100 hover:bg-green-200 text-green-700 font-bold w-12 h-12 rounded-xl border-2 border-green-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-600 font-bold text-right text-lg">Level</p>
              </div>
              <div className="flex justify-center space-x-6 mt-3">
                {levelLabels.map((label, idx) => (
                  <span
                    key={label}
                    className={`px-4 py-1 rounded-full text-sm font-bold border-2 cursor-pointer transition-all
                      ${newRetailerEffort === idx
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                        : 'bg-yellow-100 text-gray-500 border-yellow-300 hover:border-emerald-300'
                      }`}
                    onClick={() => setNewRetailerEffort(idx)}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Scheme Push Intensity */}
            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Scheme Push Intensity:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSchemePushIntensity(prev => Math.max(0, prev - 1))}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    −
                  </button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[100px] text-center">
                    {levelLabels[schemePushIntensity]}
                  </span>
                  <button
                    onClick={() => setSchemePushIntensity(prev => Math.min(2, prev + 1))}
                    className="bg-green-100 hover:bg-green-200 text-green-700 font-bold w-12 h-12 rounded-xl border-2 border-green-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-600 font-bold text-right text-lg">Level</p>
              </div>
              <div className="flex justify-center space-x-6 mt-3">
                {levelLabels.map((label, idx) => (
                  <span
                    key={label}
                    className={`px-4 py-1 rounded-full text-sm font-bold border-2 cursor-pointer transition-all
                      ${schemePushIntensity === idx
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                        : 'bg-yellow-100 text-gray-500 border-yellow-300 hover:border-emerald-300'
                      }`}
                    onClick={() => setSchemePushIntensity(idx)}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Action Buttons Row */}
          <div className="mt-10 flex flex-wrap justify-between items-center gap-4 max-w-2xl mx-auto px-4">
            <button 
              onClick={handleExit}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_rgb(153,27,27)] hover:shadow-[0_2px_0_rgb(153,27,27)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl"
            >
              [ Exit Market ]
            </button>

            <button 
              onClick={handleOK}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-4xl transform scale-110 tracking-widest"
            >
              [ OK ]
            </button>

            <button 
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl"
            >
              [ Back ]
            </button>
          </div>

        </div>

        {/* Footer Info Strip */}
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-between items-center text-lg font-bold text-gray-800">
          <div className="flex flex-col space-y-1">
            <span>Round: <span className="text-emerald-700">7</span> of 7</span>
            <span>Sales Team Available: <span className="text-emerald-700">{salesTeamAvailable}</span></span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <span>Total Manpower: <span className="text-emerald-700 text-2xl">{totalManpower}</span></span>
          </div>
          <div className="flex flex-col text-right space-y-1">
            <span>Total Coverage: <span className="text-blue-700">{totalCoverage}</span></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound7SalesTeam;
