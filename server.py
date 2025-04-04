from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
from datetime import datetime
from urllib.parse import parse_qs, urlparse

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, content_type='text/html'):
        self.send_response(200)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers()
        self.wfile.write(b'')

    def do_GET(self):
        print(f"GET request for: {self.path}")
        
        # Handle root path - redirect to index1.html
        if self.path == '/' or self.path == '/index.html':
            self.send_response(302)
            self.send_header('Location', '/index1.html')
            self.end_headers()
            return

        # Handle static files
        if self.path.endswith('.html') or self.path.endswith('.js') or self.path.endswith('.css'):
            try:
                file_path = self.path[1:]  # Remove leading slash
                print(f"Attempting to serve file: {file_path}")
                with open(file_path, 'rb') as file:
                    self._set_headers()
                    self.wfile.write(file.read())
            except FileNotFoundError:
                print(f"File not found: {file_path}")
                self.send_response(404)
                self.end_headers()
            except Exception as e:
                print(f"Error serving file: {str(e)}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        print(f"POST request for: {self.path}")
        
        if self.path == '/save-rankings':
            try:
                # Ensure content type is JSON
                if self.headers.get('Content-Type') != 'application/json':
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({
                        'success': False,
                        'error': 'Content-Type must be application/json'
                    }).encode())
                    return

                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                print(f"Received rankings data: {json.dumps(data, indent=2)}")

                # Create rankings directory if it doesn't exist
                rankings_dir = os.path.join(os.getcwd(), 'rankings')
                if not os.path.exists(rankings_dir):
                    os.makedirs(rankings_dir)
                    print(f"Created rankings directory: {rankings_dir}")

                # Generate filename with timestamp
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = os.path.join(rankings_dir, f'user_{data["userId"]}_{timestamp}.json')

                # Save rankings to file
                with open(filename, 'w') as f:
                    json.dump(data['rankings'], f, indent=2)
                print(f"Saved rankings to: {filename}")

                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True, 
                    'filename': filename,
                    'message': 'Rankings saved successfully'
                }).encode())

            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': 'Invalid JSON data'
                }).encode())
            except Exception as e:
                print(f"Error processing rankings: {str(e)}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': str(e)
                }).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run(server_class=HTTPServer, handler_class=RequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    print(f'Serving files from: {os.getcwd()}')
    print('Available files:')
    for file in os.listdir('.'):
        if file.endswith(('.html', '.js', '.css')):
            print(f'  - {file}')
    httpd.serve_forever()

if __name__ == '__main__':
    run() 