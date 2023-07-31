from django.contrib import admin

from .models import *
# Register your models here.
@admin.register(User)
class user_admin_editor(admin.ModelAdmin):
    pass
