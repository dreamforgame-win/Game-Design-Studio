import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, method = 'GET', headers = {}, body } = await req.json();

    if (!url) {
      return NextResponse.json({ error: { message: "Target URL is required" } }, { status: 400 });
    }

    // Prepare request options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
        ...headers,
      },
    };

    if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      if (!(fetchOptions.headers as Record<string, string>)['Content-Type']) {
        (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch (_) {}
    }, 20000); // 20s timeout limit

    fetchOptions.signal = controller.signal;

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    // Parse and forward raw body to maintain exact content type (handles HTML, XML, plaintext, etc. correctly)
    const responseText = await response.text();

    const resHeaders = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType) {
      resHeaders.set('Content-Type', contentType);
    } else {
      resHeaders.set('Content-Type', 'application/json');
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: resHeaders,
    });

  } catch (err: any) {
    console.error('Server side proxy error:', err);
    let message = err.message || 'Unknown server-side fetch failure';
    if (err.name === 'AbortError') {
      message = 'Request timed out on the proxy server (20s limit)';
    }
    return NextResponse.json({ 
      error: { 
        message,
        details: err.toString()
      } 
    }, { status: 502 });
  }
}
