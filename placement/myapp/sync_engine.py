import json
import os
from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# 🛡️ 1000% Reliable Sync File Path
SYNC_FILE = os.path.join(settings.BASE_DIR, 'AUTO_SYNC_DATA.json')

def export_sync_data():
    """Saves critical subjects and course data to a JSON file for Git-based mirroring"""
    try:
        from myapp.models import Course, AutomatedExamConfig
        data = {
            'courses': list(Course.objects.all().values()),
            'configs': list(AutomatedExamConfig.objects.all().values()),
        }
        with open(SYNC_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, default=str)
    except Exception as e:
        print(f"⚠️ Sync Export Warning: {e}")

def import_sync_data():
    """Loads mirrored data from JSON file into the local database automatically"""
    if not os.path.exists(SYNC_FILE):
        return
    
    try:
        from myapp.models import Course, AutomatedExamConfig
        with open(SYNC_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 1️⃣ Mirror Courses (Subjects & Topics)
        # Use 'title' as a Natural Key to prevent ID conflicts on different laptops
        for c_data in data.get('courses', []):
            unique_title = c_data.get('title')
            if unique_title:
                Course.objects.update_or_create(
                    title__iexact=unique_title.strip(), 
                    defaults={
                        'level': c_data.get('level', 'Beginner'),
                        'duration': c_data.get('duration', '0'),
                        'modules': c_data.get('modules', []),
                        'topics': c_data.get('topics', []),
                        'locked': c_data.get('locked', False),
                        'progress': c_data.get('progress', 0),
                    }
                )
        
        # 2️⃣ Mirror Exam Configurations (The DNA of the Daily Exam)
        # Use 'course_name' as a Natural Key
        for cfg_data in data.get('configs', []):
            c_name = cfg_data.get('course_name')
            if c_name:
                AutomatedExamConfig.objects.update_or_create(
                    course_name__iexact=c_name.strip(),
                    defaults={
                        'exam_name': cfg_data.get('exam_name', 'Daily Assessment'),
                        'subjects': cfg_data.get('subjects', []),
                        'duration': cfg_data.get('duration', 80),
                        'passing_strategy': cfg_data.get('passing_strategy', 'percentage'),
                        'requirement': cfg_data.get('requirement', 50),
                        'question_count': cfg_data.get('question_count', 25),
                        'marks_per_question': cfg_data.get('marks_per_question', 2),
                    }
                )
            
        # Silent sync for 1000% clean terminal
    except Exception as e:
        print(f"⚠️ Sync Import Warning: {e}")

# 🚦 Automatic Trigger: Export whenever data changes
@receiver(post_save, sender='myapp.Course')
@receiver(post_delete, sender='myapp.Course')
@receiver(post_save, sender='myapp.AutomatedExamConfig')
@receiver(post_delete, sender='myapp.AutomatedExamConfig')
def trigger_sync_export(sender, **kwargs):
    export_sync_data()
