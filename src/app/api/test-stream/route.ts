import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("Hello from mock stream! "));
      setTimeout(() => {
        controller.enqueue(new TextEncoder().encode("Streaming works!"));
        controller.close();
      }, 1000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
