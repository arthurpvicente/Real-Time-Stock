import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { getPortfolioItems } from "@/lib/actions/portfolio.actions";
import { getHoldings } from "@/lib/actions/holdings.actions";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import PortfolioButton from "@/components/PortfolioButton";
import AddHoldingButton from "@/components/AddHoldingButton";
import AutoRefresh from "@/components/AutoRefresh";

export default async function PortfolioPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const [items, holdings] = await Promise.all([
    getPortfolioItems(userId),
    getHoldings(userId),
  ]);

  if (items.length === 0) {
    return (
      <div className="watchlist-empty-container flex">
        <div className="watchlist-empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="watchlist-star"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
            />
          </svg>
          <h2 className="empty-title">Your portfolio is empty</h2>
          <p className="empty-description">
            Search for stocks and click &ldquo;Add to Portfolio&rdquo; to start tracking them here.
          </p>
          <Link href="/" className="yellow-btn px-6 py-3 inline-block text-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const holdingsMap = new Map(holdings.map((h) => [h.symbol, h]));

  const itemsWithData = await Promise.all(
    items.map(async (item) => {
      const quote = await getStockQuote(item.symbol);
      const holding = holdingsMap.get(item.symbol);
      return { ...item, quote, holding: holding ?? null };
    })
  );

  let totalInvested = 0;
  let currentValue = 0;
  for (const { quote, holding } of itemsWithData) {
    if (!holding) continue;
    totalInvested += holding.shares * holding.buyPrice;
    if (quote?.c != null) currentValue += holding.shares * quote.c;
  }
  const totalGainLoss = currentValue - totalInvested;
  const totalGainLossPct = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : null;
  const hasAnyHolding = holdings.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <AutoRefresh intervalMs={20000} />
      <h1 className="watchlist-title">My Portfolio</h1>

      {hasAnyHolding && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Invested</p>
            <p className="text-xl font-mono font-semibold text-gray-100">
              ${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Value</p>
            <p className="text-xl font-mono font-semibold text-gray-100">
              ${currentValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overall Gain / Loss</p>
            <p className={`text-xl font-mono font-semibold ${totalGainLoss >= 0 ? "text-teal-400" : "text-red-500"}`}>
              {totalGainLoss >= 0 ? "+" : ""}$
              {Math.abs(totalGainLoss).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {totalGainLossPct !== null && (
                <span className="text-sm ml-2">
                  ({totalGainLossPct >= 0 ? "+" : ""}{totalGainLossPct.toFixed(2)}%)
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="watchlist-table overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header-row">
              {WATCHLIST_TABLE_HEADER.map((header) => (
                <th key={header} className="table-header py-3 px-4 text-left text-sm font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {itemsWithData.map(({ symbol, company, quote, holding }) => {
              const price = quote?.c != null ? quote.c : null;
              const change = quote?.dp != null ? quote.dp.toFixed(2) : null;
              const changePositive = change !== null && parseFloat(change) >= 0;

              let gainLossEl = <span className="text-gray-500">—</span>;
              if (holding && price !== null) {
                const gl = (price - holding.buyPrice) * holding.shares;
                const glPct = ((price - holding.buyPrice) / holding.buyPrice) * 100;
                const positive = gl >= 0;
                gainLossEl = (
                  <span className={positive ? "text-teal-400" : "text-red-500"}>
                    {positive ? "+" : ""}${Math.abs(gl).toFixed(2)}
                    <span className="text-xs ml-1">({positive ? "+" : ""}{glPct.toFixed(2)}%)</span>
                  </span>
                );
              }

              return (
                <tr key={symbol} className="table-row">
                  <td className="table-cell px-4 py-3 text-gray-100">{company}</td>
                  <td className="table-cell px-4 py-3">
                    <Link
                      href={`/stocks/${symbol}`}
                      className="font-mono text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      {symbol}
                    </Link>
                  </td>
                  <td className="table-cell px-4 py-3 font-mono text-gray-100">
                    {price !== null ? `$${price.toFixed(2)}` : "—"}
                  </td>
                  <td className="table-cell px-4 py-3 font-mono">
                    {change !== null ? (
                      <span className={changePositive ? "text-teal-400" : "text-red-500"}>
                        {changePositive ? "+" : ""}{change}%
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="table-cell px-4 py-3 font-mono text-gray-100">
                    {holding ? holding.shares : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="table-cell px-4 py-3 font-mono text-gray-100">
                    {holding ? `$${holding.buyPrice.toFixed(2)}` : <span className="text-gray-500">—</span>}
                  </td>
                  <td className="table-cell px-4 py-3 font-mono">{gainLossEl}</td>
                  <td className="table-cell px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PortfolioButton
                        symbol={symbol}
                        company={company}
                        isInWatchlist={true}
                        showTrashIcon={true}
                        type="button"
                      />
                      <AddHoldingButton
                        symbol={symbol}
                        company={company}
                        hasHolding={!!holding}
                        currentPrice={price}
                        initialShares={holding?.shares}
                        initialBuyPrice={holding?.buyPrice}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
