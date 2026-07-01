import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const GameDistributionSummary = () => {
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const formatROI = (val) => {
    if (val === null || val === undefined || val === "") return "—";
    return `${parseFloat(val).toFixed(2)}%`;
  };

  // Read per-round data from localStorage
  const rounds = [
    {
      round: "Round 1",
      situation: "Market Establishment",
      roi: localStorage.getItem("gameDistributionR1DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR1RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR1CashInHand") || (() => {
        const r1NetPayment = parseInt(localStorage.getItem("gameDistributionR1NetPaymentReceived") || "0", 10);
        const r1TradeScheme = parseInt(localStorage.getItem("gameDistributionR1TradeSchemeSpend") || "0", 10);
        const baseCash = 5000000;
        return baseCash + r1NetPayment - r1TradeScheme;
      })(),
    },
    {
      round: "Round 2",
      situation: "Competition Response",
      roi: localStorage.getItem("gameDistributionR2DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR2RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR2CashInHand") || (() => {
        const r1NetPayment = parseInt(localStorage.getItem("gameDistributionR1NetPaymentReceived") || "0", 10);
        const r1TradeScheme = parseInt(localStorage.getItem("gameDistributionR1TradeSchemeSpend") || "0", 10);
        const r2NetPayment = parseInt(localStorage.getItem("gameDistributionR2NetPaymentReceived") || "0", 10);
        const r2TradeScheme = parseInt(localStorage.getItem("gameDistributionR2TradeSchemeSpend") || "0", 10);
        const baseCash = 5000000;
        return baseCash + r1NetPayment - r1TradeScheme + r2NetPayment - r2TradeScheme;
      })(),
    },
    {
      round: "Round 3",
      situation: "Market Expansion Drive",
      roi: localStorage.getItem("gameDistributionR3DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR3RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR3CashInHand") || (() => {
        const r2NetPayment = parseInt(localStorage.getItem("gameDistributionR2NetPaymentReceived") || "0", 10);
        const r2TradeScheme = parseInt(localStorage.getItem("gameDistributionR2TradeSchemeSpend") || "0", 10);
        const currentCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
        return currentCash + r2NetPayment - r2TradeScheme;
      })(),
    },
    {
      round: "Round 4",
      situation: "Consolidation Phase",
      roi: localStorage.getItem("gameDistributionR4DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR4RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR4CashInHand") || (() => {
        const r3NetPayment = parseInt(localStorage.getItem("gameDistributionR3NetPaymentReceived") || "0", 10);
        const r3TradeScheme = parseInt(localStorage.getItem("gameDistributionR3TradeSchemeSpend") || "0", 10);
        const r4NetPayment = parseInt(localStorage.getItem("gameDistributionR4NetPaymentReceived") || "0", 10);
        const r4TradeScheme = parseInt(localStorage.getItem("gameDistributionR4TradeSchemeSpend") || "0", 10);
        const baseCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
        return baseCash + r3NetPayment - r3TradeScheme + r4NetPayment - r4TradeScheme;
      })(),
    },
    {
      round: "Round 5",
      situation: "Growth Acceleration",
      roi: localStorage.getItem("gameDistributionR5DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR5RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR5CashInHand") || (() => {
        const r4NetPayment = parseInt(localStorage.getItem("gameDistributionR4NetPaymentReceived") || "0", 10);
        const r4TradeScheme = parseInt(localStorage.getItem("gameDistributionR4TradeSchemeSpend") || "0", 10);
        const baseCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
        return baseCash + r4NetPayment - r4TradeScheme;
      })(),
    },
    {
      round: "Round 6",
      situation: "Market Dominance",
      roi: localStorage.getItem("gameDistributionR6DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR6RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR6CashInHand") || (() => {
        const r5NetPayment = parseInt(localStorage.getItem("gameDistributionR5NetPaymentReceived") || "0", 10);
        const r5TradeScheme = parseInt(localStorage.getItem("gameDistributionR5TradeSchemeSpend") || "0", 10);
        const baseCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
        return baseCash + r5NetPayment - r5TradeScheme;
      })(),
    },
    {
      round: "Round 7",
      situation: "Final Results",
      roi: localStorage.getItem("gameDistributionR7DistributorROI"),
      satisfaction: localStorage.getItem("gameDistributionR7RetailerSatisfaction"),
      cashInHand: localStorage.getItem("gameDistributionR7CashInHand") || (() => {
        const r6NetPayment = parseInt(localStorage.getItem("gameDistributionR6NetPaymentReceived") || "0", 10);
        const r6TradeScheme = parseInt(localStorage.getItem("gameDistributionR6TradeSchemeSpend") || "0", 10);
        const r7NetPayment = parseInt(localStorage.getItem("gameDistributionR7NetPaymentReceived") || "0", 10);
        const r7TradeScheme = parseInt(localStorage.getItem("gameDistributionR7TradeSchemeSpend") || "0", 10);
        const baseCash = parseInt(localStorage.getItem("gameDistributionCash") || "5000000", 10);
        return baseCash + r6NetPayment - r6TradeScheme + r7NetPayment - r7TradeScheme;
      })(),
    },
  ];

  const getSatisfactionColor = (val) => {
    if (val === "High") return "#15803d";
    if (val === "Medium") return "#d97706";
    return "#dc2626";
  };

  const getROIColor = (val) => {
    if (!val) return "#374151";
    const num = parseFloat(val);
    if (num > 10) return "#15803d";
    if (num > 0) return "#d97706";
    return "#dc2626";
  };

  const handleDownload = () => {
    const userName = localStorage.getItem("userName") || "Player";
    const now = new Date().toLocaleString("en-IN");

    // Initialize jsPDF in landscape mode
    const doc = new jsPDF("landscape");

    // Title
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // red-600
    doc.text("Game Summary", 14, 22);

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("All Rounds - Performance Overview", 14, 30);

    // Meta info
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Player: ${userName}`, 14, 40);
    doc.text(`Generated: ${now}`, 14, 46);

    // Table data mapping
    const tableColumn = ["Round", "Situation", "Distributor ROI", "Retailer Satisfaction", "Cash in Hand"];
    const tableRowsData = rounds.map(r => [
      r.round,
      r.situation,
      r.roi ? parseFloat(r.roi).toFixed(2) + "%" : "—",
      r.satisfaction || "—",
      r.cashInHand !== null && r.cashInHand !== undefined
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.round(r.cashInHand))
        : "—"
    ]);

    // Generate table
    autoTable(doc, {
      startY: 55,
      head: [tableColumn],
      body: tableRowsData,
      theme: 'grid',
      headStyles: { fillColor: [21, 128, 61], textColor: [255, 255, 255] }, // emerald-700
      alternateRowStyles: { fillColor: [254, 252, 232] }, // yellow-50
      styles: { fontSize: 11, cellPadding: 5 },
      didParseCell: function(data) {
        if (data.section === 'body') {
          // Distributor ROI coloring
          if (data.column.index === 2) {
             const val = parseFloat(data.cell.raw);
             if (val > 10) data.cell.styles.textColor = [21, 128, 61];
             else if (val >= 0) data.cell.styles.textColor = [217, 119, 6];
             else if (val < 0) data.cell.styles.textColor = [220, 38, 38];
             data.cell.styles.fontStyle = 'bold';
          }
          // Retailer Satisfaction coloring
          if (data.column.index === 3) {
             const val = data.cell.raw;
             if (val === 'High') data.cell.styles.textColor = [21, 128, 61];
             else if (val === 'Medium') data.cell.styles.textColor = [217, 119, 6];
             else if (val === 'Low') data.cell.styles.textColor = [220, 38, 38];
             data.cell.styles.fontStyle = 'bold';
          }
          // Cash in Hand coloring
          if (data.column.index === 4) {
             data.cell.styles.textColor = [29, 78, 216]; // blue-700
             data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    // Save directly as PDF, skipping the print dialog
    doc.save(`Game_Summary_${userName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExit = () => {
    navigate("/game-simulation");
  };

  const userName = localStorage.getItem("userName") || "Player";

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="w-full max-w-5xl bg-yellow-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-200">

        {/* Top bar */}
        <div className="bg-emerald-700 text-emerald-50 px-6 py-3 flex justify-between items-center text-sm font-bold tracking-widest uppercase border-b-4 border-emerald-800">
          <span>Game Simulation</span>
          <span className="text-emerald-200 text-xs">Player: {userName}</span>
        </div>

        {/* Header */}
        <div className="text-center pt-8 pb-4 border-b-4 border-yellow-200/50">
          <h1 className="text-4xl font-extrabold text-red-600 tracking-wider uppercase drop-shadow-sm px-4">
            🏆 Game Summary
          </h1>
          <p className="text-gray-500 mt-2 text-sm font-medium tracking-wide">
            All Rounds – Performance Overview
          </p>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-10">

          {/* Summary Table */}
          <div className="mb-8 overflow-x-auto" ref={tableRef}>
            <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-emerald-700 text-white">
                    <th className="px-4 py-3 text-left font-bold tracking-wide">Round</th>
                    <th className="px-4 py-3 font-bold tracking-wide">Situation</th>
                    <th className="px-4 py-3 font-bold tracking-wide">Distributor ROI</th>
                    <th className="px-4 py-3 font-bold tracking-wide">Retailer Satisfaction</th>
                    <th className="px-4 py-3 font-bold tracking-wide">Cash in Hand</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r, idx) => (
                    <tr
                      key={r.round}
                      className={`border-b border-yellow-200 transition-colors ${
                        idx % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100/60"
                      } hover:bg-emerald-50`}
                    >
                      {/* Round */}
                      <td className="px-4 py-3 text-left">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center shadow">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-gray-800">{r.round}</span>
                        </span>
                      </td>

                      {/* Situation */}
                      <td className="px-4 py-3 text-gray-700 font-medium italic">{r.situation}</td>

                      {/* Distributor ROI */}
                      <td className="px-4 py-3 font-extrabold text-base" style={{ color: getROIColor(r.roi) }}>
                        {formatROI(r.roi)}
                      </td>

                      {/* Retailer Satisfaction */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm"
                          style={{
                            backgroundColor: getSatisfactionColor(r.satisfaction),
                          }}
                        >
                          {r.satisfaction || "—"}
                        </span>
                      </td>

                      {/* Cash in Hand */}
                      <td className="px-4 py-3 font-extrabold text-blue-700 text-base">
                        {formatCurrency(r.cashInHand)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-emerald-700 inline-block"></span> High / ROI &gt; 10%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Medium / ROI 0–10%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block"></span> Low / Negative ROI
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-10 rounded-xl shadow-[0_6px_0_rgb(29,78,216)] hover:shadow-[0_3px_0_rgb(29,78,216)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-lg tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Summary (PDF)
            </button>

            <button
              onClick={handleExit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-10 rounded-xl shadow-[0_6px_0_rgb(5,150,105)] hover:shadow-[0_3px_0_rgb(5,150,105)] hover:translate-y-[3px] active:shadow-none active:translate-y-[6px] transition-all text-lg tracking-wide"
            >
              Exit to Home
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-yellow-100 border-t-4 border-yellow-300 px-8 py-5 flex justify-center items-center text-sm font-bold text-gray-800 uppercase italic">
          <span>Simulation Complete – Business Year Closed</span>
        </div>

      </div>
    </div>
  );
};

export default GameDistributionSummary;
