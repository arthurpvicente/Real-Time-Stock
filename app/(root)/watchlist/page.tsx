import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { getWatchlistItems } from "@/lib/actions/watchlist.actions";
import { getStockQuote } from "@/lib/actions/finnhub.actions";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import WatchlistButton from "@/components/WatchlistButton";

export default async function WatchlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session!.user.id;

  const items = await getWatchlistItems(userId);

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
          <h2 className="empty-title">Your watchlist is empty</h2>
          <p className="empty-description">
            Search for stocks and click &ldquo;Add to Watchlist&rdquo; to track them here.
          </p>
          <Link href="/" className="yellow-btn px-6 py-3 inline-block text-center">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const itemsWithQuotes = await Promise.all(
    items.map(async (item) => {
      const quote = await getStockQuote(item.symbol);
      return { ...item, quote };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="watchlist-title">My Watchlist</h1>

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
            {itemsWithQuotes.map(({ symbol, company, quote }) => {
              const price = quote?.c != null ? `$${quote.c.toFixed(2)}` : "—";
              const change = quote?.dp != null ? quote.dp.toFixed(2) : null;
              const changePositive = change !== null && parseFloat(change) >= 0;

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
                  <td className="table-cell px-4 py-3 font-mono text-gray-100">{price}</td>
                  <td className="table-cell px-4 py-3 font-mono">
                    {change !== null ? (
                      <span className={changePositive ? "text-teal-400" : "text-red-500"}>
                        {changePositive ? "+" : ""}
                        {change}%
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="table-cell px-4 py-3 text-gray-500">—</td>
                  <td className="table-cell px-4 py-3 text-gray-500">—</td>
                  <td className="table-cell px-4 py-3 text-gray-500">—</td>
                  <td className="table-cell px-4 py-3">
                    <WatchlistButton
                      symbol={symbol}
                      company={company}
                      isInWatchlist={true}
                      showTrashIcon={true}
                      type="button"
                    />
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
