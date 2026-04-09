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

def run():
    ip = get_ip()
    print(f"\n🚀 1000% RELIABLE SYNC SERVER INITIALIZING...")
    print(f"🌍 NETWORK IP DETECTED: {ip}")
    print(f"🔗 FRIENDS SHOULD USE: http://{ip}:5173")
    print(f"🛡️  BACKEND RUNNING ON: 0.0.0.0:8000 (PUBLICLY ACCESSIBLE)\n")
    
    os.chdir('placement')
    try:
        # Run migrations first to ensure Point 12 (Permanence)
        subprocess.run([sys.executable, "manage.py", "migrate"], check=True)
        # Run server on all interfaces
        subprocess.run([sys.executable, "manage.py", "runserver", "0.0.0.0:8000"])
    except KeyboardInterrupt:
        print("\n👋 Sync Server Stopped.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    run()
