from django.contrib import admin

from .models import EmailConfiguration, Job


@admin.register(EmailConfiguration)
class EmailConfigurationAdmin(admin.ModelAdmin):
    list_display = ('provider_name', 'email_host_user', 'email_host', 'email_port', 'is_active', 'updated_at')
    list_filter = ('is_active', 'email_use_tls', 'email_use_ssl')
    search_fields = ('provider_name', 'email_host_user', 'email_host')


admin.site.register(Job)

