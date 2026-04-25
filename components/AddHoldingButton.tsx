"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHoldingAction, removeHoldingAction } from "@/lib/actions/holdings.actions";

interface AddHoldingButtonProps {
  symbol: string;
  company: string;
  hasHolding: boolean;
  currentPrice: number | null;
  initialShares?: number;
  initialBuyPrice?: number;
}

export default function AddHoldingButton({
  symbol,
  company,
  hasHolding,
  currentPrice,
  initialShares,
  initialBuyPrice,
}: AddHoldingButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [buyDate, setBuyDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const parsedAmount = parseFloat(amount);
  const buyPrice = currentPrice ?? initialBuyPrice ?? 0;
  const calculatedShares = buyPrice > 0 && parsedAmount > 0 ? parsedAmount / buyPrice : null;

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val) {
      setAmount(
        initialShares && initialBuyPrice
          ? (initialShares * initialBuyPrice).toFixed(2)
          : ""
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculatedShares || calculatedShares <= 0) return setError("Enter a valid amount to invest.");
    if (!buyPrice || buyPrice <= 0) return setError("Current price unavailable. Try again later.");

    setError("");
    startTransition(async () => {
      const result = await addHoldingAction(symbol, company, calculatedShares, buyPrice, new Date(buyDate));
      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Failed to save holding.");
      }
    });
  };

  const handleRemove = () => {
    startTransition(async () => {
      await removeHoldingAction(symbol);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <div className="flex items-center gap-2">
        <DialogTrigger asChild>
          <button
            className="text-xs px-2 py-1 rounded border border-yellow-400/40 text-yellow-400 hover:bg-yellow-400/10 transition-colors"
            title={hasHolding ? "Edit holding" : "Track holding"}
          >
            {hasHolding ? "Edit" : "+ Holding"}
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="bg-[#0f1117] border border-white/10 text-gray-100 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">
            {hasHolding ? "Edit" : "Add"} Holding — {symbol}
          </DialogTitle>
        </DialogHeader>

        {buyPrice > 0 && (
          <p className="text-sm text-gray-500 -mt-2">
            Current price:{" "}
            <span className="text-gray-300 font-mono">${buyPrice.toFixed(2)}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
          <div className="flex flex-col gap-1">
            <Label htmlFor="amount" className="text-gray-400 text-sm">Amount to Invest ($)</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              min="0.01"
              placeholder="e.g. 1500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-600"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-gray-400 text-sm">You would get</Label>
            <Input
              readOnly
              value={calculatedShares !== null ? `${calculatedShares.toFixed(6)} shares` : ""}
              placeholder="Enter amount above"
              className="bg-white/5 border-white/10 text-yellow-400 font-mono placeholder:text-gray-600 cursor-default"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="buyDate" className="text-gray-400 text-sm">Buy Date</Label>
            <Input
              id="buyDate"
              type="date"
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              className="bg-white/5 border-white/10 text-gray-100"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={isPending || !calculatedShares}
            className="bg-yellow-400 text-black font-semibold hover:bg-yellow-300"
          >
            {isPending ? "Saving..." : "Save Holding"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
