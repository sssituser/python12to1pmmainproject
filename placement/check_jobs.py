import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placement.settings')
django.setup()

from myapp.models import Job

def check_jobs():
    jobs = Job.objects.all()
    print(f"Total jobs in DB: {jobs.count()}")
    if jobs.exists():
        print("Jobs list:")
        for j in jobs:
            print(f"- ID {j.id}: {j.job_title} at {j.company}")
    else:
        print("No jobs found in DB.")

if __name__ == "__main__":
    check_jobs()
