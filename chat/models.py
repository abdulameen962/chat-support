from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

# Create your models here.
from main.models import User

class Message(models.Model):
    body = models.TextField(_("Body of the message"))
    sent_by = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User,blank=True,null=True,on_delete=models.SET_NULL)
    
    class Meta:
        ordering = ("-created_at",)
        
    
    def __str__(self):
        return f"{self.body} was sent by {self.sent_by} at {self.created_at}"
    
    
class Room(models.Model):
    class Connection_status(models.TextChoices):
        WAITING = "wating"
        ACTIVE = "active"
        CLOSED = "closed"
    
    uuid = models.CharField(max_length=255)
    client = models.CharField(max_length=255)
    agent = models.ForeignKey(User,related_name="rooms",blank=True,null=True,on_delete=models.SET_NULL)
    messages = models.ManyToManyField(Message,blank=True)
    url = models.CharField(max_length=255,blank=True,null=True)
    status = models.CharField(max_length=20,choices=Connection_status.choices,default=Connection_status.WAITING)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ("-created_at",)
        
    
    def __str__(self):
        return f"{self.client} - {self.uuid}"
    
    
    
    