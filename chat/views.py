from django.shortcuts import render
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.db.models import Prefetch
from django.urls import reverse
from django.contrib import messages
from django.http import HttpResponseRedirect
from main.forms import AddUserForm,EditUserForm
from django.contrib.auth.models import Group

from .models import Room,User,Message
# Create your views here.

@require_POST
def create_room(request,uuid):
    name = request.POST.get('name','')
    url = request.POST.get('url','')
    
    Room.objects.create(uuid=uuid,client=name,url=url)
    
    return JsonResponse({"message":"Room created"},status=201)

@login_required
def admin(request):
    rooms = Room.objects.all()
    users = User.objects.filter(is_staff=True)
    
    return render(request,"chat/admin.html",{
        "rooms": rooms,
        "users":users
    })
    
@login_required
def room(request,uuid):
    room = Room.objects.prefetch_related(
            Prefetch(
                "messages",
                queryset=Message.objects.only('body','sent_by','created_at','created_by'),
                to_attr='all_messages'
            )
        ).get(uuid=uuid)
    
    if room.status == Room.Connection_status.WAITING:
        room.status = Room.Connection_status.ACTIVE
        room.agent = request.user
        
        room.save()
        
    return render(request,"chat/room.html",{
        "room": room
    })
    

@login_required
def delete_room(request,uuid):
    if request.user.has_perm('room.delete_user'):
        room = Room.objects.get(uuid=uuid)  
        room.delete()
        
        messages.success(request,"The room has been deleted sucessfully")
        return HttpResponseRedirect(reverse("chat:admin"))
        
    messages.error(request,"You don\'t have access to edit rooms")
                
    return HttpResponseRedirect(reverse("chat:admin"))   

@login_required
def user_details(request,uuid):
    user = User.objects.prefetch_related(
        Prefetch(
            'rooms',
            to_attr='all_rooms'
        )
        ).get(pk=uuid)
    
    rooms = user.all_rooms
    
    return render(request,"chat/user-details.html",{
        "user_detail":user,
        "rooms": rooms
    })
    
@login_required
def edit_user(request,uuid):
    if request.user.has_perm('user.edit_user'):
        user = User.objects.get(pk=uuid)    
        
        if request.method == "POST":
            form = EditUserForm(request.POST,instance=user)
            
            if form.is_valid():
                form.save()
                
                messages.success(request,"The changes have been added successfully")
                return HttpResponseRedirect(reverse("chat:admin"))
            
        else:
            form = EditUserForm(instance=user)
            
            return render(request,"chat/edit-user.html",{
                "user":user,
                "form": form,
            })
    
    messages.error(request,"You don\'t have access to add users")
                
    return HttpResponseRedirect(reverse("chat:admin"))
    

@login_required
def add_user(request):
    if request.user.has_perm('user.add_user'):
        if request.method == "POST":
            form = AddUserForm(request.POST)
            
            if form.is_valid():
                user = form.save(commit=False)
                user.is_staff = True
                user.set_password(request.POST.get('password'))
                user.save()
                
                if user.role == User.MANAGER:
                    group = Group.objects.get(name="Managers")
                    group.user_set.add(user)
                    
                messages.success(request,"The user was added successfully")
                
                return HttpResponseRedirect(reverse("chat:admin"))
                
        
        else:
            form = AddUserForm()
        
        return render(request,"chat/add-user.html",{
            "form": form
        })
        
    messages.error(request,"You don\'t have access to add users")
    
    return HttpResponseRedirect(reverse("chat:admin"))


        