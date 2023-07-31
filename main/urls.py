from django.urls import path
from django.contrib.auth.views import LoginView

from . import views
from .forms import LoginForm

app_name = "main"
urlpatterns = [
    path("",views.index,name="index"),
    path("about/",views.about,name="about"),
    path('login/', LoginView.as_view(template_name='main/login.html', form_class=LoginForm), name='login'),
]
