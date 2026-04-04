from django.contrib import admin

from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('company', 'job_title', 'location', 'deadline', 'status')
    list_filter = ('status', 'job_type', 'experience')
    search_fields = ('company', 'job_title', 'location')
