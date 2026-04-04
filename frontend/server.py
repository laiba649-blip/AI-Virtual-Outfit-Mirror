#!/usr/bin/env python3
"""
AI Virtual Outfit Mirror - Frontend Development Server
Simple HTTP server to serve the frontend files
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler to handle CORS and routing"""
    
    def end_headers(self):
        """Add CORS headers to all responses"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Handle preflight requests"""
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests with SPA routing support"""
        # Parse the URL
        parsed_path = urlparse(self.path)
        
        # If it's an API route, redirect to backend
        if parsed_path.path.startswith('/api/'):
            self.send_response(302)
            self.send_header('Location', f'http://localhost:8000{parsed_path.path}')
            self.end_headers()
            return
        
        # For SPA routing, serve index.html for non-file requests
        if not os.path.exists(parsed_path.path[1:]) and parsed_path.path != '/':
            self.path = '/index.html'
        
        return super().do_GET()

def main():
    """Main function to start the frontend server"""
    
    PORT = 3001
    
    print("=" * 60)
    print("🎨 AI Virtual Outfit Mirror - Frontend Server")
    print("=" * 60)
    print("🚀 Starting frontend server...")
    print(f"📍 Frontend will be available at: http://localhost:{PORT}")
    print("📚 Make sure backend server is running on port 8000")
    print("=" * 60)
    
    # Change to frontend directory
    try:
        os.chdir(os.path.dirname(os.path.abspath(__file__)))
        print(f"📂 Serving files from: {os.getcwd()}")
    except Exception as e:
        print(f"❌ Error changing directory: {e}")
        sys.exit(1)
    
    # Start the server
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"✅ Server running on port {PORT}")
            print("🌐 Open your browser and navigate to:")
            print(f"   http://localhost:{PORT}")
            print("\n💡 Press Ctrl+C to stop the server")
            print("=" * 60)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use")
            print("💡 Make sure no other server is running on this port")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
