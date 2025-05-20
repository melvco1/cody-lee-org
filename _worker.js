addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/admin.html') {
      return fetch(request);
    }
  
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
  
    const formData = await request.formData();
    const token = formData.get('token');
    if (!token || token !== 'your-secret-token-123') {
      return new Response('Unauthorized Access', { status: 401 });
    }
  
    return new Response('Authenticated Successfully!', { status: 200 });
  }