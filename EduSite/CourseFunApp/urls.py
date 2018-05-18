from django.urls import path

from . import views


urlpatterns = [
    path('questions/list/<slug:qtype>/', views.get_question_list),
    path('questions/editor/<slug:qtype>/', views.question_editor),
    path('questions/editor/<slug:qtype>/<int:qid>/', views.question_editor),
#    path('delete/<int:notice_id>/', views.delete_notice),
#    path('get/', views.get_notices),
]

