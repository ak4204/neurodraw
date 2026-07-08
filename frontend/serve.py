import http.server
import os

PORT = 7860
DIRECTORY = "dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def do_GET(self):
        path = self.translate_path(self.path)
        # If the file doesn't exist, fallback to index.html for React Router
        if not os.path.exists(path) or os.path.isdir(path):
            self.path = '/'
        return super().do_GET()

print(f"Starting server on port {PORT}...", flush=True)

# We MUST use ThreadingHTTPServer instead of TCPServer, because Hugging Face's 
# health checkers keep connections open. A single-threaded server gets stuck!
with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
    print(f"Server successfully bound to port {PORT}! Ready for traffic.", flush=True)
    httpd.serve_forever()
