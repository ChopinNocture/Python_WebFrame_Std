from django.urls import path

from . import views

app_name = 'StatisticApp'
urlpatterns = [
    path('get/', views.get_statistic, name='statistic'),
    path('exam_answer/', views.get_exam_answer_json, name='exam_answer'),
    path('notices/', views.get_notices_json, name='notices'),    
]

