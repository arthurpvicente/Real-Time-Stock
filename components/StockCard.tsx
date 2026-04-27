"use client";

import Link from "next/link";
import PortfolioButton from "@/components/PortfolioButton";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  isInPortfolio: boolean;
}

export default function StockCard({ symbol, name, price, change, isInPortfolio }: StockCardProps) {
  const positive = change !== null && change >= 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 hover:border-yellow-400/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/stocks/${symbol}`}
            className="text-xs font-mono font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            {symbol}
          </Link>
          <p className="text-sm text-gray-300 mt-0.5 line-clamp-1">{name}</p>
        </div>
        <div className="[&_.watchlist-star]:h-4 [&_.watchlist-star]:w-4">
          <PortfolioButton
            symbol={symbol}
            company={name}
            isInWatchlist={isInPortfolio}
            type="icon"
          />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <p className="text-lg font-mono font-semibold text-gray-100">
          {price !== null ? `$${price.toFixed(2)}` : "—"}
        </p>
        {change !== null ? (
          <span className={`text-sm font-mono ${positive ? "text-teal-400" : "text-red-500"}`}>
            {positive ? "+" : ""}{change.toFixed(2)}%
          </span>
        ) : (
          <span className="text-sm text-gray-600">—</span>
        )}
      </div>
    </div>
  );
}
