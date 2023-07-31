from django.contrib import admin

from .models import *
# Register your models here.
@admin.register(Message)
class message_admin(admin.ModelAdmin):
    pass

@admin.register(Room)
class room_admin(admin.ModelAdmin):
    pass