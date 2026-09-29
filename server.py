import http.server
import socketserver
import urllib.request
import json
import os

PORT = 8080
API_KEY = "oao-store-hNwhQeNaQuS7MOUjGfVukkHGctNsyXBI"
TARGET_URL = "https://oao.clipora.buzz/v1/chat/completions"

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            req = urllib.request.Request(TARGET_URL, data=post_data, method='POST')
            req.add_header('Content-Type', 'application/json')
            # API KEY DISEMBUYIKAN DI BACKEND
            req.add_header('Authorization', f'Bearer {API_KEY}')
            
            try:
                with urllib.request.urlopen(req) as response:
                    res_body = response.read()
                    self.send_response(response.status)
                    for k, v in response.headers.items():
                        if k.lower() not in ['transfer-encoding', 'connection']:
                            self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(res_body)
            except urllib.error.HTTPError as e:
                self.send_response(e.code)
                self.end_headers()
                self.wfile.write(e.read())
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_error(404, "Not Found")

# Ensure we serve files from the current directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
    print(f"Server berjalan di http://localhost:{PORT}")
    print(f"Backend proxy aktif menyembunyikan API key untuk keamanan.")
    httpd.serve_forever()
