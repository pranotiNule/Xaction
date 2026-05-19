import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkIfGameCompleted } from './dbUtils';

const GameDistributionIntro = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const userId = localStorage.getItem("userId") || localStorage.getItem("userEmail");
      if (userId) {
        const completed = await checkIfGameCompleted(userId);
        if (completed) {
          setAlreadyPlayed(true);
          setIsChecking(false);
          return; // Stop here, don't navigate automatically
        }
      }
      setIsChecking(false);
    };
    checkStatus();
  }, []);

  const handleBack = () => {
    navigate("/game-simulation");
  };

  const handleNext = () => {
    // Clear previous game state to ensure a fresh start
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("gameDistribution") && key !== "gameDistributionCurrentRound") {
        localStorage.removeItem(key);
      }
    });
    localStorage.setItem("gameDistributionCurrentRound", "1");
    navigate("/game-distribution/inventory");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-emerald-600 font-bold text-xl animate-pulse text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Verifying Simulation Access...
        </div>
      </div>
    );
  }

  if (alreadyPlayed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        {/* Modal Overlay */}
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-10"></div>
        
        {/* Modal Content */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-20 transform transition-all translate-y-0 scale-100 animate-fade-in-up">
          <div className="bg-red-600 px-6 py-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Access Denied
            </h1>
          </div>
          
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Simulation Already Completed</h2>
            <p className="text-gray-600 mb-8 text-lg">
              You have already successfully completed this simulation. Each participant is allowed only one attempt to ensure fairness.
            </p>
            
            <button
              onClick={() => navigate("/game-simulation")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Strip */}
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Distributor Simulation Game
          </h1>
          <span className="bg-emerald-800 text-white text-sm px-3 py-1 rounded-full">
            Sunshine Agency
          </span>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
            Introduction
          </h2>

          <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
            <p className="font-medium text-emerald-800 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              You have 7 rounds (weeks) to build the most successful FMCG distribution business of Tedbury in your territory. The distributor is Sunshine Agency. You will control key decisions such as inventory ordering, retailer credit, sales team deployment, and trade scheme execution. Your goal is to maximize profit, maintain healthy cash flow, and grow market share.
            </p>

            <div className="space-y-5 mt-8">
              <div className="border-l-4 border-emerald-500 pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">📦 Inventory Planning</h3>
                <p>Start with a basic stock mix across available SKUs. As the game progresses, adjust your orders based on retailer demand, market trends, and sales performance. Ordering too little may cause stockouts and lost sales, while ordering too much can lock up your working capital and create slow-moving inventory.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">📈 Market Demand</h3>
                <p>Customer demand changes every round. Factors such as seasonality, competitor promotions, retailer relationships, and scheme attractiveness influence how much product retailers order from you. Watch the market signals carefully and plan your inventory accordingly.</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">🤝 Retailer Relationships</h3>
                <p>Retailers decide how strongly they support your products. Offering the right credit terms, schemes, and consistent supply improves retailer trust and increases orders. Poor service or stock shortages can weaken relationships and reduce your sales potential.</p>
              </div>

              <div className="border-l-4 border-amber-500 pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">💰 Cash Flow Management</h3>
                <p>Distributors operate on tight working capital. If you extend too much credit or overstock inventory, your cash flow may suffer. Managing your credit cycle, collections, and stock levels is critical to sustaining growth.</p>
              </div>
            </div>

            <p className="mt-8 pt-6 border-t font-medium text-gray-800 text-center italic">
              At the end of the simulation you will see your Distributor ROI, market share, retailer satisfaction, and cash flow health. Use each round to refine your strategy and try to build the most efficient and profitable distribution network.
            </p>
          </div>

          {/* Action Footer */}
          <div className="mt-10 flex justify-between items-center">
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center group"
            >
              Next
              <svg 
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDistributionIntro;
