import { API_BASE_URL } from '@/lib/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
// Per-process protection; production replicas must additionally share an edge rate limit.
const usage = new Map<string, {
    count: number;
    expires: number;
}>();
const windowMs = 60000;
export async function POST(req: Request) {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ') || auth.length > 8192)
        return NextResponse.json({ error: 'Please log in to use the assistant' }, { status: 401 });
    if (req.headers.get('origin') && req.headers.get('origin') !== new URL(req.url).origin)
        return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
    let payload: unknown;
    try {
        const reader = req.body?.getReader();
        if (!reader)
            throw new Error('Empty body');
        let size = 0;
        const chunks: Uint8Array[] = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done)
                break;
            size += value.byteLength;
            if (size > 8192) {
                await reader.cancel();
                return NextResponse.json({ error: 'Message too large' }, { status: 413 });
            }
            chunks.push(value);
        }
        const bytes = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
            bytes.set(chunk, offset);
            offset += chunk.length;
        }
        payload = JSON.parse(new TextDecoder().decode(bytes));
    }
    catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    if (!payload || typeof payload !== 'object' || !('message' in payload) || typeof payload.message !== 'string' || !payload.message.trim() || payload.message.length > 2000)
        return NextResponse.json({ error: 'Message must contain 1–2000 characters' }, { status: 400 });
    const lang = 'lang' in payload && payload.lang === 'ar' ? 'ar' : 'en';
    try {
        const account = await fetch(API_BASE_URL + '/auth/me', { headers: { Authorization: auth }, cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!account.ok)
            return NextResponse.json({ error: account.status >= 500 ? 'Account service unavailable' : 'Please log in again' }, { status: account.status >= 500 ? 503 : 401 });
        const { user } = await account.json();
        const id = user?._id || user?.id;
        if (typeof id !== 'string')
            return NextResponse.json({ error: 'Invalid account' }, { status: 401 });
        const now = Date.now();
        for (const [key, value] of usage)
            if (value.expires <= now)
                usage.delete(key);
        const entry = usage.get(id) || { count: 0, expires: now + windowMs };
        if (entry.count >= 10)
            return NextResponse.json({ error: 'Please wait before sending more messages' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.expires - now) / 1000)) } });
        entry.count++;
        usage.set(id, entry);
        const key = process.env.GEMINI_API_KEY, modelName = process.env.GEMINI_MODEL;
        if (!key || !modelName)
            return NextResponse.json({ error: 'Assistant is not configured yet' }, { status: 503 });
        const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: modelName, systemInstruction: 'You are Bastha support. Reply in ' + (lang === 'ar' ? 'Arabic' : 'English') + '. You have no live inventory, prices, orders, or conversation history. Never invent them. Direct users to product search, offers, and order pages. Do not claim to perform actions.', generationConfig: { maxOutputTokens: 500 } });
        const result = await model.generateContent(payload.message.trim(), { timeout: 20000 });
        return NextResponse.json({ text: result.response.text() });
    }
    catch {
        return NextResponse.json({ error: 'Assistant temporarily unavailable' }, { status: 503 });
    }
}
