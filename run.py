#!/usr/bin/env python3
"""
IT Support Tool - Service Runner
Run backend and frontend separately
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_backend_setup():
    """Check if backend is properly set up"""
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    requirements_file = backend_dir / "requirements.txt"
    if not requirements_file.exists():
        print("❌ backend/requirements.txt not found!")
        return False
    
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  .env file not found!")
        print("📝 Please copy env.example to .env and configure your settings")
        print("   cp env.example .env")
        return False
    
    return True

def start_backend():
    """Start backend server with uvicorn"""
    print("🔧 Starting backend server with uvicorn...")
    
    # Change to backend directory
    os.chdir("backend")
    
    # Start uvicorn server
    backend_process = subprocess.Popen([
        "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8030", "--reload"
    ])
    
    # Change back to root directory
    os.chdir("..")
    
    return backend_process

def start_frontend():
    """Start frontend development server"""
    print("📱 Starting frontend development server...")
    frontend_process = subprocess.Popen(["npm", "run", "dev"])
    return frontend_process

def main():
    print("🎯 IT Support Tool - Starting Services")
    print("=" * 40)
    
    # Check setup
    if not check_backend_setup():
        return
    
    # Check if database is set up
    print("📊 Make sure your MySQL database is set up:")
    print("   mysql -u root -p itsupport < database_init.sql")
    
    input("\n⏸️  Press Enter to start services...")
    
    # Start services
    backend_process = start_backend()
    time.sleep(3)  # Wait for backend to start
    frontend_process = start_frontend()
    
    print("\n🎉 Services started!")
    print("📱 Frontend: http://localhost:3000")
    print("🔧 Backend API: http://localhost:8030")
    print("📚 API Docs: http://localhost:8030/docs")
    print("\n💡 Default login credentials:")
    print("   PM User: pm@example.com / password123")
    print("   Dev User: dev@example.com / password123")
    print("\n⏹️  Press Ctrl+C to stop all services")
    
    try:
        # Wait for processes
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ Services stopped")

if __name__ == "__main__":
    main()
