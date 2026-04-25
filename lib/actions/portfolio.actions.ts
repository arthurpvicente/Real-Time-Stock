'use server';

import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import { Portfolio } from '@/database/models/portfolio.model';
import { Holdings } from '@/database/models/holdings.model';

export async function getPortfolioSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Portfolio.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getPortfolioSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToPortfolioAction(symbol: string, company: string): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false };

  try {
    await connectToDatabase();
    await Portfolio.findOneAndUpdate(
      { userId: session.user.id, symbol: symbol.toUpperCase() },
      { $setOnInsert: { userId: session.user.id, symbol: symbol.toUpperCase(), company, addedAt: new Date() } },
      { upsert: true }
    );
    return { success: true };
  } catch (err) {
    console.error('addToPortfolio error:', err);
    return { success: false };
  }
}

export async function removeFromPortfolioAction(symbol: string): Promise<{ success: boolean }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false };

  try {
    await connectToDatabase();
    await Promise.all([
      Portfolio.deleteOne({ userId: session.user.id, symbol: symbol.toUpperCase() }),
      Holdings.deleteOne({ userId: session.user.id, symbol: symbol.toUpperCase() }),
    ]);
    return { success: true };
  } catch (err) {
    console.error('removeFromPortfolio error:', err);
    return { success: false };
  }
}

export async function getPortfolioItems(
  userId: string
): Promise<Array<{ userId: string; symbol: string; company: string; addedAt: Date }>> {
  try {
    await connectToDatabase();
    const items = await Portfolio.find({ userId }).sort({ addedAt: -1 }).lean();
    return items.map((item) => ({
      userId: item.userId,
      symbol: item.symbol,
      company: item.company,
      addedAt: item.addedAt,
    }));
  } catch (err) {
    console.error('getPortfolioItems error:', err);
    return [];
  }
}
