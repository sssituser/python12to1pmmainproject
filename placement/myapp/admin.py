from django.contrib import admin
from .models import (
    User, StudentProfile, Skill, Project,
    Job, JobApplication, LeaveRequest,
    Exam, ExamAttempt, MCQQuestion, CodingQuestion, TestCase,
    MCQAnswer, CodeSubmission
)


class MCQQuestionInline(admin.TabularInline):
    model = MCQQuestion
    extra = 3
    fields = ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'marks', 'time_limit_seconds']


class TestCaseInline(admin.TabularInline):
    model = TestCase
    extra = 2
    fields = ['input_data', 'expected_output', 'is_sample']


class CodingQuestionInline(admin.StackedInline):
    model = CodingQuestion
    extra = 1
    fields = ['title', 'description', 'input_format', 'output_format', 'constraints', 'marks']
    show_change_link = True


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display  = ['title', 'user', 'exam_type', 'start_date', 'start_time', 'end_time', 'duration_minutes', 'is_finished', 'total_marks']
    list_filter   = ['exam_type', 'is_finished', 'start_date']
    search_fields = ['title', 'user__username']
    list_editable = ['is_finished']
    ordering      = ['-start_date']
    inlines       = [MCQQuestionInline, CodingQuestionInline]
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'title', 'exam_type')
        }),
        ('Schedule', {
            'fields': ('start_date', 'start_time', 'end_time', 'duration_minutes')
        }),
        ('Marks & Status', {
            'fields': ('total_marks', 'score', 'is_finished')
        }),
    )


@admin.register(CodingQuestion)
class CodingQuestionAdmin(admin.ModelAdmin):
    list_display  = ['title', 'exam', 'marks']
    inlines       = [TestCaseInline]
    search_fields = ['title', 'exam__title']


@admin.register(MCQQuestion)
class MCQQuestionAdmin(admin.ModelAdmin):
    list_display  = ['question_text', 'exam', 'correct_option', 'marks']
    list_filter   = ['correct_option']
    search_fields = ['question_text', 'exam__title']


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = ['exam', 'status', 'attempted_at']
    list_filter  = ['status']


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display  = ['id', 'username', 'email']
    search_fields = ['username', 'email']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display  = ['job_title', 'company', 'location', 'deadline', 'status']
    list_filter   = ['status']
    search_fields = ['job_title', 'company']


@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display  = ['name', 'start_date', 'end_date', 'status', 'approved_by']
    list_filter   = ['status']
    list_editable = ['status', 'approved_by']


admin.site.register(StudentProfile)
admin.site.register(Skill)
admin.site.register(Project)
admin.site.register(JobApplication)
admin.site.register(MCQAnswer)
admin.site.register(CodeSubmission)