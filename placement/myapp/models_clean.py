import random

# ===============================
# OTP
# ===============================

class OTP(models.Model):
    email = models.EmailField(null=True, blank=True)
    username = models.CharField(max_length=100, null=True, blank=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self, length=6):
        if length == 4:
            self.otp = str(random.randint(1000, 9999))
        else:
            self.otp = str(random.randint(100000, 999999))

# ===============================
# COURSE SYSTEM
# ===============================

class Course(models.Model):
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    duration = models.CharField(max_length=50)  # e.g., "3 hrs"
    progress = models.IntegerField(default=0)  # Default progress percentage
    locked = models.BooleanField(default=False)
    topics = models.JSONField(default=list)  # Store topics as JSON array
    custom_videos = models.JSONField(default=dict, blank=True)  # Store custom videos
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['created_at']

class CourseTopic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='topic_records')
    topic_text = models.CharField(max_length=200)
    order = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.course.title} - {self.topic_text}"

    class Meta:
        ordering = ['order']

class CourseEnrollment(models.Model):
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE, related_name='course_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    is_locked = models.BooleanField(default=False)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.course.title}"

    class Meta:
        unique_together = ('user', 'course')

class StudentTopicProgress(models.Model):
    enrollment = models.ForeignKey(CourseEnrollment, on_delete=models.CASCADE, related_name='topic_progress')
    topic = models.ForeignKey(CourseTopic, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.enrollment.user.username} - {self.topic.topic_text} - {'Completed' if self.is_completed else 'In Progress'}"

    class Meta:
        unique_together = ('enrollment', 'topic')

# ===============================
# Student Profile
# ===============================

class StudentProfile(models.Model):
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE)
    student_id = models.IntegerField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    state = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    parent_phone = models.CharField(max_length=15, blank=True)
    college = models.CharField(max_length=200, blank=True)
    year = models.CharField(max_length=50, blank=True)
    cgpa = models.FloatField(null=True, blank=True)
    tenth_percentage = models.FloatField(null=True, blank=True)
    twelfth_percentage = models.FloatField(null=True, blank=True)
    github = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    education = models.JSONField(blank=True, null=True, default=list)
    profile_image = models.ImageField(upload_to="profile_images/", blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profiles')

    def __str__(self):
        return self.user.username

class Skill(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="skills")
    name = models.CharField(max_length=100)
    level = models.IntegerField(default=50)

    def __str__(self):
        return self.name

class Project(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="projects")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# ===============================
# JOB SYSTEM
# ===============================

class Job(models.Model):

    company = models.CharField(max_length=200)
    job_title = models.CharField(max_length=200)
    primary_skills = models.TextField(blank=True)

    location = models.CharField(max_length=200, blank=True)
    deadline = models.DateField()

    status = models.CharField(max_length=50, default="Open")

    # 🔥 ADD THESE BELOW
    job_type = models.CharField(max_length=50, blank=True)
    experience = models.CharField(max_length=50, blank=True)
    salary = models.CharField(max_length=50, blank=True)
    eligibility = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True, null=True)
    responsibilities = models.TextField(blank=True, null=True)
    external_application_link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.company} - {self.job_title}"

    class Meta:
        ordering = ['-created_at']

class AppliedJob(models.Model):
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.job.job_title}"

    class Meta:
        unique_together = ('user', 'job')

# ===============================
# LOGIN EMAIL TRACKING
# ===============================

class LoginEmailLog(models.Model):
    """Track login confirmation emails sent to users for auto-deletion management"""
    user = models.ForeignKey('myapp.User', on_delete=models.CASCADE, related_name='login_email_logs')
    email_address = models.EmailField()
    email_subject = models.CharField(max_length=255, default='🔐 Login Confirmation - SSSIT Placement Portal')
    email_message_id = models.CharField(max_length=255, blank=True, null=True, help_text="IMAP Message ID for deletion")
    sent_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False, help_text="Soft delete flag")
    deleted_at = models.DateTimeField(null=True, blank=True)
    login_time = models.CharField(max_length=50, blank=True)
    user_ip = models.CharField(max_length=50, blank=True)
    browser_info = models.CharField(max_length=255, blank=True)
    
    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['email_address', '-sent_at']),
            models.Index(fields=['user', '-sent_at']),
        ]
    
    def save(self, *args, **kwargs):
        """
        DYNAMIC ROLLING CLEANUP: Ensures a strict 30-message limit per email address.
        Triggers automatically on every new log creation.
        """
        super().save(*args, **kwargs)
        
        try:
            # Identify the latest 30 IDs for this specific email
            latest_ids = LoginEmailLog.objects.filter(
                email_address=self.email_address
            ).order_by('-sent_at').values_list('id', flat=True)[:30]
            
            # Efficiently bulk-delete everything older than the top 30
            LoginEmailLog.objects.filter(
                email_address=self.email_address
            ).exclude(id__in=list(latest_ids)).delete()
        except Exception:
            # Failsafe to prevent disruption of login flow
            pass

    def __str__(self):
        return f"Login email to {self.email_address} at {self.sent_at}"
    
    @classmethod
    def get_user_active_login_emails_count(cls, user):
        """Get count of non-deleted login emails for a user"""
        return cls.objects.filter(user=user, is_deleted=False).count()
    
    @classmethod
    def get_user_oldest_active_emails(cls, user, count=30):
        """Get oldest active (non-deleted) login emails for a user"""
        return cls.objects.filter(user=user, is_deleted=False).order_by('sent_at')[:count]
    
    @classmethod
    def get_email_active_count(cls, email_address):
        """Get total count of non-deleted login emails sent to a specific email address (across all users)"""
        return cls.objects.filter(email_address=email_address, is_deleted=False).count()
