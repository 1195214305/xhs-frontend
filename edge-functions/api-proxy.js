// 阿里云 ESA 边缘函数 - API 代理
// 用于将前端请求代理到后端 API 服务器

const BACKEND_URL = 'https://your-backend-api.com'; // 替换为你的后端地址

async function handleRequest(request) {
  const url = new URL(request.url);

  // 只代理 /api 开头的请求
  if (!url.pathname.startsWith('/api')) {
    return null; // 返回 null 让 ESA 继续处理静态资源
  }

  // 构建后端请求 URL
  const backendUrl = new URL(url.pathname + url.search, BACKEND_URL);

  // 复制请求头
  const headers = new Headers(request.headers);
  headers.set('Host', new URL(BACKEND_URL).host);

  // 添加 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // 转发请求到后端
    const response = await fetch(backendUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
    });

    // 复制响应并添加 CORS 头
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Backend request failed', message: error.message }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

addEventListener('fetch', (event) => {
  const response = handleRequest(event.request);
  if (response) {
    event.respondWith(response);
  }
});
