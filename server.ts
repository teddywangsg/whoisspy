const PUBLIC_DIR = `${import.meta.dir}/public`;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(path) {
  const ext = path.substring(path.lastIndexOf('.'));
  return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = Bun.serve({
  port: 3456,
  async fetch(request) {
    const url = new URL(request.url);
    let path = url.pathname;
    
    if (path === '/') {
      path = '/index.html';
    }
    
    const filePath = `${PUBLIC_DIR}${path}`;
    
    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();
      if (exists) {
        return new Response(file, {
          headers: { 'Content-Type': getMimeType(path) }
        });
      }
    } catch (e) {
      console.error(`Error serving ${filePath}:`, e);
    }
    
    return new Response('Not Found', { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);