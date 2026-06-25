import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound6TradeScheme = () => {
  const navigate = useNavigate();

  // Round 6: Company reimburses 5%. Anything above is from Distributor margin.
  const approvedScheme = 5; 

  // Always start from defaults (fresh slate for each round visit)
  const [quantityDiscount, setQuantityDiscount] = useState(0);
  const [retailDisplayIncentive, setRetailDisplayIncentive] = useState(0);

  const totalScheme = quantityDiscount + retailDisplayIncentive;
  
  // Margin calculation: 8% - (Total Scheme - 5%)
  // Note: Early Payment Discount is handled in Credit Control, but for the summary here we'll show the base margin impact.
  const extraScheme = Math.max(0, totalScheme - approvedScheme);
  const distributorMargin = 8 - extraScheme;

  // Save scheme values to localStorage
  useEffect(() => {
    localStorage.setItem("gameDistributionR6QuantityDiscount", quantityDiscount.toString());
    localStorage.setItem("gameDistributionR6RetailDisplay", retailDisplayIncentive.toString());
    localStorage.setItem("gameDistributionR6TotalScheme", totalScheme.toString());
  }, [quantityDiscount, retailDisplayIncentive, totalScheme]);

  const handleIncrement = (type) => {
    if (totalScheme >= 8) return;
    
    if (type === "quantity") {
      setQuantityDiscount(prev => prev + 1);
    } else {
      setRetailDisplayIncentive(prev => prev + 1);
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
    navigate("/game-distribution/round6-credit-control");
  };

  const handleBack = () => {
    navigate("/game-distribution/round6-inventory");
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit?")) {
      navigate("/game-simulation");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            Round 6 – Trade Scheme Control
          </h1>
        </div>

        <div className="p-8 sm:p-12">
          <div className="text-center mb-6">
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Tesle is offering <span className="font-bold text-red-600">7% Trade + 3% Visibility</span>. 
              Tedbury Company reimburses only <span className="font-bold text-emerald-700">5%</span>. 
              <br/>
              <span className="text-red-600 font-bold italic underline">Capping is removed:</span> You can match Tesle, but additional scheme is funded from <span className="font-bold">your own margin</span>.
            </p>
          </div>

          <div className="flex flex-col items-center max-w-2xl mx-auto space-y-8">
            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Quantity Discount:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => handleDecrement("quantity")} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]">-</button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[80px] text-center">{quantityDiscount}%</span>
                  <button onClick={() => handleIncrement("quantity")} className="bg-green-100 hover:bg-green-200 text-green-700 font-bold w-12 h-12 rounded-xl border-2 border-green-300 text-2xl transition-all active:translate-y-[2px]">+</button>
                </div>
                <p className="text-gray-600 font-medium text-right">Discount on Bulk Orders</p>
              </div>
            </div>

            <div className="w-full bg-yellow-50 p-6 rounded-2xl border-2 border-yellow-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Retail Display Incentive:</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={() => handleDecrement("retail")} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold w-12 h-12 rounded-xl border-2 border-red-300 text-2xl transition-all active:translate-y-[2px]">-</button>
                  <span className="text-4xl font-extrabold text-emerald-700 min-w-[80px] text-center">{retailDisplayIncentive}%</span>
                  <button onClick={() => handleIncrement("retail")} className="bg-green-100 hover:bg-green-200 text-green-700 font-bold w-12 h-12 rounded-xl border-2 border-green-300 text-2xl transition-all active:translate-y-[2px]">+</button>
                </div>
                <p className="text-gray-600 font-medium text-right">Visibility Support</p>
              </div>
            </div>

            <div className="w-full bg-white p-6 rounded-2xl border-4 border-emerald-400 shadow-lg text-center space-y-4">
              <p className="text-xl font-bold text-gray-800">
                Total Scheme: <span className="text-emerald-700">{totalScheme}%</span>
              </p>
              <div className="bg-emerald-50 p-4 rounded-xl border-2 border-emerald-200">
                <p className="text-md font-bold text-gray-700 mb-1 uppercase tracking-wider">Distributor Margin Calculation:</p>
                <p className="text-2xl font-black text-emerald-800">
                  8% - ({totalScheme}% - 5%) = <span className="text-red-600 underline">{distributorMargin.toFixed(1)}%</span>
                </p>
                <p className="text-[10px] text-gray-500 mt-2 italic">* Margin reduces by 1% for every 1% additional scheme funded by you.</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-between items-center gap-4 max-w-2xl mx-auto px-4">
            <button onClick={handleExit} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_rgb(153,27,27)] text-xl">[ Exit Market ]</button>
            <button onClick={handleOK} className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] text-4xl transform scale-110 tracking-widest">[ OK ]</button>
            <button onClick={handleBack} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] text-xl">[ Back ]</button>
          </div>
        </div>

        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-between items-center text-lg font-bold text-gray-800">
          <div className="flex flex-col space-y-1">
            <span>Round: <span className="text-emerald-700">6</span> of 7</span>
            <span>Company Approved: <span className="text-emerald-700">5%</span></span>
          </div>
          <div className="flex flex-col text-right space-y-1">
            <span>Margin Impact: <span className="text-red-600 font-bold">-{extraScheme}%</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDistributionRound6TradeScheme;
