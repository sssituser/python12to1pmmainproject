import os
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from brain.ai_services import is_online, gemini_generate

print("Checking Gemini API key integration...")
print("GEMINI_API_KEY:", os.environ.get("GEMINI_API_KEY"))
online = is_online()
print("Is online:", online)
if online:
    res = gemini_generate("Hello! Tell me in 5 words if you are working.")
    print("Response:", res)
else:
    print("Gemini could not be initialized or reached.")
