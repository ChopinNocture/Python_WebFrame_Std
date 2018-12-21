from django.urls import path

from . import views

app_name = 'BrainHoleEditor'
urlpatterns = [
    path('test/', views.test),
    path('storyboard/', views.storyboard),
]