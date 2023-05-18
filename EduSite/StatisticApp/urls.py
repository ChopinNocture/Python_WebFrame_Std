from django.urls import path

from . import views

app_name = 'StatisticApp'
urlpatterns = [
    path('get/', views.get_statistic, name='statistic'),
    
]

