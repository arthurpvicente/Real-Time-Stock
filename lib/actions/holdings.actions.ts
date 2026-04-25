'use server';

import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/database/mongoose';
import { Holdings } from '@/database/models/holdings.model';

export async function addHoldingAction(
  symbol: string,
  company: string,
  shares: number,
  buyPrice: number,
  buyDate: Date
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: 'Not authenticated' };

  try {
    await connectToDatabase();
    await Holdings.findOneAndUpdate(
      { userId: session.user.id, symbol: symbol.toUpperCase() },
      { userId: session.user.id, symbol: symbol.toUpperCase(), company, shares, buyPrice, buyDate },
      { upsert: true }
    );
    revalidatePath('/portfolio');
    return { success: true };
  } catch (err) {
    console.error('addHolding error:', err);
    return { success: false, error: 'Failed to save holding' };
  }
}

export async function removeHoldingAction(symbol: string): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false };

  try {
    await connectToDatabase();
    await Holdings.deleteOne({ userId: session.user.id, symbol: symbol.toUpperCase() });
    revalidatePath('/portfolio');
    return { success: true };
  } catch (err) {
    console.error('removeHolding error:', err);
    return { success: false };
  }
}

export async function getHoldings(
  userId: string
): Promise<Array<{ symbol: string; company: string; shares: number; buyPrice: number; buyDate: Date }>> {
  try {
    await connectToDatabase();
    const items = await Holdings.find({ userId }).lean();
    return items.map((item) => ({
      symbol: item.symbol,
      company: item.company,
      shares: item.shares,
      buyPrice: item.buyPrice,
      buyDate: item.buyDate,
    }));
  } catch (err) {
    console.error('getHoldings error:', err);
    return [];
  }
}
