from django.urls import path

from . import views

urlpatterns = [
    path('', views.test_session, name='tester'),
    path('teacher', views.test_teacher)
]