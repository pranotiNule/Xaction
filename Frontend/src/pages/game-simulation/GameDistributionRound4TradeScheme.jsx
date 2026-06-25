import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound4TradeScheme = () => {
  const navigate = useNavigate();

  // Initialize state from localStorage
  const [cash, setCash] = useState(() => {
    const saved = localStorage.getItem("gameDistributionCash");
    return saved !== null ? parseInt(saved, 10) : 5000000;
  });

  // The approved scheme % from Company (5% base + 4% additional)
  const [approvedScheme, setApprovedScheme] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR4ApprovedScheme");
    // Upgrade existing local storage value from 4 to 9 if they are testing
    return saved !== null && parseFloat(saved) !== 4 ? parseFloat(saved) : 9; 
  });

  const [quantityDiscount, setQuantityDiscount] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR4QuantityDiscount");
    return saved !== null ? parseInt(saved, 10) || 0 : 0;
  });
  const [retailDisplayIncentive, setRetailDisplayIncentive] = useState(() => {
    const saved = localStorage.getItem("gameDistributionR4RetailDisplay");
    return saved !== null ? parseInt(saved, 10) || 0 : 0;
  });

  const totalScheme = quantityDiscount + retailDisplayIncentive;
  const remainingScheme = approvedScheme - totalScheme;

  // Save scheme values to localStorage
  useEffect(() => {
    localStorage.setItem("gameDistributionR4QuantityDiscount", quantityDiscount.toString());
    localStorage.setItem("gameDistributionR4RetailDisplay", retailDisplayIncentive.toString());
  }, [quantityDiscount, retailDisplayIncentive]);

  const handleIncrement = (type) => {
    if (totalScheme < approvedScheme) {
      if (type === "quantity") {
        setQuantityDiscount(prev => prev + 1);
      } else {
        setRetailDisplayIncentive(prev => prev + 1);
      }
    } else {
      alert(`Total scheme cannot exceed ${approvedScheme}%!`);
    }
  };

  const handleDecrement = (type) => {
    if (type === "quantity" && quantityDiscount > 0) {
      setQuantityDiscount(prev => prev - 1);
    } else if (type === "retail" && retailDisplayIncentive > 0) {
      setRetailDisplayIncentive(prev => prev - 1);
    }
  };

  const handleOK = () => {
    navigate("/game-distribution/round4-credit-control");
  };

  const handleBack = () => {
    navigate("/game-distribution/round4-inventory");
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit the market?")) {
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
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 4 – Trade Scheme Control
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12">
          
          {/* Description */}
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              In this <span className="font-bold text-red-600">Manpower Shortage</span> phase, trade schemes can help maintain retailer loyalty even if visit frequency is slightly reduced.
              The additional approved scheme from Company is <span className="font-bold text-emerald-700">4%</span> (making the total limit <span className="font-bold text-emerald-700">{approvedScheme}%</span>) for Round 4.
            </p>
          </div>

          <div className="text-center mb-10">
            <p className="text-md text-gray-600 italic">
              Use schemes to ensure retailers keep ordering despite limited field support.
            </p>
          </div>

          {/* Scheme Controls */}
          <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8">
            
            {/* Quantity Discount */}
            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quantity Discount:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDecrement("quantity")}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    −
                  </button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[80px] text-center">
                    {quantityDiscount}%
                  </span>
                  <button
                    onClick={() => handleIncrement("quantity")}
                    className={`font-bold w-12 h-12 rounded-xl border-2 text-2xl transition-all active:translate-y-[2px]
                      ${totalScheme < approvedScheme 
                        ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300' 
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-600 font-medium text-right">Discount on Bulk Orders</p>
              </div>
            </div>

            {/* Retail Display Incentive */}
            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Retail Display Incentive:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleDecrement("retail")}
                    className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]"
                  >
                    −
                  </button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[80px] text-center">
                    {retailDisplayIncentive}%
                  </span>
                  <button
                    onClick={() => handleIncrement("retail")}
                    className={`font-bold w-12 h-12 rounded-xl border-2 text-2xl transition-all active:translate-y-[2px]
                      ${totalScheme < approvedScheme 
                        ? 'bg-green-100 hover:bg-green-200 text-green-700 border-green-300' 
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'}`}
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-600 font-medium text-right">Per Retailer Display Support</p>
              </div>
            </div>

            {/* Scheme Summary */}
            <div className="w-full bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200 text-center">
              <p className="text-lg font-bold text-gray-800">
                Total Scheme Used: <span className={`${totalScheme > approvedScheme ? 'text-red-600' : 'text-emerald-700'}`}>{totalScheme}%</span> / <span className="text-emerald-700">{approvedScheme}%</span>
              </p>
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
            <span>Round: <span className="text-emerald-700">4</span> of 7</span>
            <span>Available Scheme: <span className="text-emerald-700">{remainingScheme >= 0 ? remainingScheme : 0}%</span></span>
          </div>
          <div className="flex flex-col text-right space-y-1">
            <span>Market Condition: <span className="text-red-600 font-bold">Manpower Shortage</span></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound4TradeScheme;
