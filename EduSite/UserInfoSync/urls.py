from django.urls import path

from . import views

app_name = 'UserInfoSync'
urlpatterns = [
    path('all/', views.sync_all),
]