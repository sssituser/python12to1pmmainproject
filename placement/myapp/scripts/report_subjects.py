import os
import django
import json
import sys

# Ensure the project root is in path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import Course

def get_report():
    courses = Course.objects.all().order_by('created_at')
    report = []
    
    for c in courses:
        # Resolve subjects from topics list or modules list
        subjects = []
        if isinstance(c.topics, list):
            subjects.extend(c.topics)
        
        # If modules exist, they might contain the subjects
        if isinstance(c.modules, list):
            for mod in c.modules:
                if isinstance(mod, dict):
                    subjects.append(mod.get('title', 'Untitled Module'))
                elif isinstance(mod, str):
                    subjects.append(mod)
        
        # Deduplicate
        unique_subjects = sorted(list(set(subjects)))
        
        report.append({
            "title": c.title,
            "level": c.level,
            "subjects": unique_subjects if unique_subjects else ["No subjects added yet"]
        })
    
    print(json.dumps(report, indent=4))

if __name__ == "__main__":
    get_report()
