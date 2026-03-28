import { synapse } from '@/ai/flows/synapse-flow';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`>>> [API:${requestId}] Request received.`);
  
  try {
    const { systemPrompt, messages } = await req.json();

    if (!systemPrompt || !messages) {
      console.warn(`>>> [API:${requestId}] Missing parameters.`);
      return new Response(JSON.stringify({ error: 'Missing systemPrompt or messages' }), { status: 400 });
    }

    console.log(`>>> [API:${requestId}] Invoking Synapse Flow...`);
    const stream = await synapse(systemPrompt, messages);
    console.log(`>>> [API:${requestId}] Stream created, sending response.`);
    
    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
  } catch (error: any) {
    console.error(`>>> [API:${requestId}] FATAL ERROR:`, error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
