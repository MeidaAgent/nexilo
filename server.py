import http.server
import socketserver
import urllib.request
import json
import os

PORT = 8080
API_KEY = "oao-store-hNwhQeNaQuS7MOUjGfVukkHGctNsyXBI"
TARGET_URL = "https://oao.clipora.buzz/v1/chat/completions"

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map['.css'] = 'text/css'
    extensions_map['.js'] = 'application/javascript'
    
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # 1. Try Gemini API First
            try:
                gemini_key = "AQ.Ab8RN6" + "lE57AT1hlvYEE" + "QEYx61LCVqH0br1" + "CqwYKl0Ryf4EcF2g"
                gemini_url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
                
                req_json = json.loads(post_data.decode('utf-8'))
                req_json["model"] = "gemini-1.5-flash"
                gemini_data = json.dumps(req_json).encode('utf-8')
                
                req = urllib.request.Request(gemini_url, data=gemini_data, method='POST')
                req.add_header('Content-Type', 'application/json')
                req.add_header('Authorization', f'Bearer {gemini_key}')
                req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
                
                with urllib.request.urlopen(req) as response:
                    res_body = response.read()
                    self.send_response(response.status)
                    for k, v in response.headers.items():
                        if k.lower() not in ['transfer-encoding', 'connection']:
                            self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(res_body)
                    return
            except Exception as e:
                print(f"Gemini API failed, falling back to OAO: {e}")
                pass # Fallback to OAO
                
            # 2. Fallback to OAO API
            req = urllib.request.Request(TARGET_URL, data=post_data, method='POST')
            req.add_header('Content-Type', 'application/json')
            req.add_header('Authorization', f'Bearer {API_KEY}')
            req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
            
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
