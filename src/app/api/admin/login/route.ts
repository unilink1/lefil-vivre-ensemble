import { NextRequest, NextResponse } from 'next/server';

const ADMIN_CODE = process.env.ADMIN_CODE || '';

let failedAttempts = 0;
let lockedUntil: number | null = null;

export async function POST(req: NextRequest) {
  try {
    if (lockedUntil && Date.now() < lockedUntil) {
      return NextResponse.json({ error: 'Trop de tentatives. Reessayez dans 30 minutes.' }, { status: 429 });
    }

    const { code } = await req.json();

    if (!ADMIN_CODE) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 });
    }

    if (code === ADMIN_CODE) {
      failedAttempts = 0;
      lockedUntil = null;
      return NextResponse.json({ success: true });
    }

    failedAttempts++;
    if (failedAttempts >= 5) {
      lockedUntil = Date.now() + 30 * 60 * 1000;
      failedAttempts = 0;
      return NextResponse.json({ error: 'Trop de tentatives. Reessayez dans 30 minutes.' }, { status: 429 });
    }

    return NextResponse.json({ error: 'Code incorrect.' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
