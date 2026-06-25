import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameDistributionRound7Inventory = () => {
  const navigate = useNavigate();
  
  const [cash, setCash] = useState(() => {
    let currentCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
    const isInitialized = localStorage.getItem("gameDistributionR7CashInitialized");
    
    if (!isInitialized) {
      const r6NetPaymentReceived = parseInt(localStorage.getItem("gameDistributionR6NetPaymentReceived") || "0", 10);
      const r6TradeSchemeSpend = parseInt(localStorage.getItem("gameDistributionR6TradeSchemeSpend") || "0", 10);
      currentCash = currentCash + r6NetPaymentReceived - r6TradeSchemeSpend;
      localStorage.setItem("gameDistributionR7CashInitialized", "true");
      localStorage.setItem("gameDistributionCash", currentCash.toString());
    }
    return currentCash;
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("gameDistributionRound7Inventory");
    if (saved) return JSON.parse(saved);
    
    return {
      milk: { name: "Tedbury Milk Chocolate", price: 100, qty: 0 },
      dark: { name: "Tedbury Dark Chocolate", price: 150, qty: 0 },
      wafer: { name: "Tedbury Wafer Chocolate", price: 80, qty: 0 },
      gift: { name: "Tedbury Gift Packs", price: 500, qty: 0 }
    };
  });

  useEffect(() => {
    localStorage.setItem("gameDistributionCash", cash.toString());
    localStorage.setItem("gameDistributionRound7Inventory", JSON.stringify(inventory));
  }, [cash, inventory]);

  const handleBuy = (productId) => {
    navigate(`/game-distribution/acquisition?product=${productId}&round=7`);
  };

  const handleOK = () => {
    navigate("/game-distribution/round7-trade-scheme");
  };

  const handleBack = () => {
    navigate("/game-distribution/round7-intro");
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit?")) {
      navigate("/simulation");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans">
      
      {/* Main Game Container */}
      <div className="w-full max-w-4xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">
        
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
        </div>

        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm">
            Round 7: Inventory / Purchasing
          </h1>
        </div>

        {/* Content Area */}
        <div className="p-8 sm:p-12">
          
          {/* Context & Guidelines */}
          <div className="bg-white border-4 border-yellow-300 rounded-xl p-6 sm:p-8 mb-10 shadow-sm max-w-4xl mx-auto space-y-6">
            <div className="text-gray-800 text-lg sm:text-xl font-medium leading-relaxed">
              Available Capital: <span className="font-bold text-emerald-700">{formatCurrency(cash)}</span>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <h3 className="font-bold text-red-800 text-xl flex items-center mb-2">
                Year-End Pressure:
              </h3>
              <p className="text-gray-700 leading-relaxed font-medium">
                Company has pushed 20% additional primary billing. Your stock levels have increased. You must decide whether to take even more to smash the annual targets or focus on ROI.
              </p>
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              You have {formatCurrency(cash)} and:
            </h2>
          </div>

          {/* Product List */}
          <div className="flex flex-col items-center max-w-3xl mx-auto space-y-6">
            
            {/* Milk Chocolate */}
            <div className="flex w-full items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <span className="text-2xl font-bold text-gray-800">
                  {inventory.milk.qty} Units – {inventory.milk.name}
                </span>
              </div>
              <button 
                onClick={() => handleBuy('milk')}
                className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl border border-gray-300 shadow-[0_4px_0_rgb(209,213,219)] hover:shadow-[0_2px_0_rgb(209,213,219)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-lg min-w-[220px] cursor-pointer"
              >
                Buy {inventory.milk.qty > 0 ? 'More ' : ''}Milk Chocolate
              </button>
            </div>

            {/* Dark Chocolate */}
            <div className="flex w-full items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <span className="text-2xl font-bold text-gray-800">
                  {inventory.dark.qty} Units – {inventory.dark.name}
                </span>
              </div>
              <button 
                onClick={() => handleBuy('dark')}
                className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl border border-gray-300 shadow-[0_4px_0_rgb(209,213,219)] hover:shadow-[0_2px_0_rgb(209,213,219)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-lg min-w-[220px] cursor-pointer"
              >
                Buy {inventory.dark.qty > 0 ? 'More ' : ''}Dark Chocolate
              </button>
            </div>

            {/* Wafer Chocolate */}
            <div className="flex w-full items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <span className="text-2xl font-bold text-gray-800">
                  {inventory.wafer.qty} Units – {inventory.wafer.name}
                </span>
              </div>
              <button 
                onClick={() => handleBuy('wafer')}
                className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl border border-gray-300 shadow-[0_4px_0_rgb(209,213,219)] hover:shadow-[0_2px_0_rgb(209,213,219)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-lg min-w-[220px] cursor-pointer"
              >
                Buy {inventory.wafer.qty > 0 ? 'More ' : ''}Wafer Chocolate
              </button>
            </div>

            {/* Gift Packs */}
            <div className="flex w-full items-center justify-between bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <span className="text-2xl font-bold text-gray-800">
                  {inventory.gift.qty} Units – {inventory.gift.name}
                </span>
              </div>
              <button 
                onClick={() => handleBuy('gift')}
                className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl border border-gray-300 shadow-[0_4px_0_rgb(209,213,219)] hover:shadow-[0_2px_0_rgb(209,213,219)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-lg min-w-[220px] cursor-pointer"
              >
                Buy {inventory.gift.qty > 0 ? 'More ' : ''}Gift Packs
              </button>
            </div>

          </div>

          {/* Action Buttons Row */}
          <div className="mt-16 flex flex-wrap justify-between items-center gap-4 max-w-3xl mx-auto">
            <button 
              onClick={handleExit}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_rgb(153,27,27)] hover:shadow-[0_2px_0_rgb(153,27,27)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl"
            >
              Exit Market
            </button>

            <button 
              onClick={handleOK}
              className="bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 px-16 rounded-xl shadow-[0_6px_0_rgb(21,128,61)] hover:shadow-[0_3px_0_rgb(21,128,61)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-4xl transform scale-110"
            >
              OK
            </button>

            <button 
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-xl shadow-[0_4px_0_rgb(75,85,99)] hover:shadow-[0_2px_0_rgb(75,85,99)] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all text-xl"
            >
              Back
            </button>
          </div>

        </div>

        {/* Footer Info Strip */}
        <div className="bg-yellow-100 border-t-2 border-yellow-300 px-8 py-4 flex justify-between items-center text-lg font-bold text-gray-800">
          <div className="flex flex-col">
            <span>Round: 7 of 7</span>
            <span>Cash Available: {formatCurrency(cash)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span>Target Progress: 95% YTD</span>
            <span>Market Condition: Year-End Push</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionRound7Inventory;
