import os
import socket
import subprocess
import sys

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def cleanup_port(port=8000):
    try:
        if sys.platform == "win32":
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True).decode()
            for line in output.strip().split('\n'):
                if f":{port}" in line and "LISTENING" in line:
                    pid = line.strip().split()[-1]
                    subprocess.run(f"taskkill /F /PID {pid}", shell=True, capture_output=True)
    except:
        pass

def run():
    cleanup_port(8000)
    ip = get_ip()
    print(f"\n🚀 1000% RELIABLE SYNC SERVER INITIALIZING...")
    print(f"🌍 NETWORK IP DETECTED: {ip}")
    print(f"🔗 FRIENDS SHOULD USE: http://{ip}:5173")
    print(f"🛡️  BACKEND RUNNING ON: 0.0.0.0:8000 (PUBLICLY ACCESSIBLE)\n")
    
    os.chdir('placement')
    try:
        # 🧪 Step 1: Health Check & Migration
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        
        # 🏗️ Step 2: Start Networked Engine
        subprocess.run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"])
    except KeyboardInterrupt:
        print("\n👋 Sync Server Stopped.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    run()
