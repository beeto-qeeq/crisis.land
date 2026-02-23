import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const result = await db.query('SELECT * FROM events ORDER BY created_at DESC LIMIT 1000');
        return NextResponse.json({ success: true, data: result.rows });
    } catch (error: any) {
        console.error("DB GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
