from django.urls import path

from . import views

app_name = 'CourseFunApp'
urlpatterns = [
    path('questions/list/<slug:qtype>/', views.get_question_list, name='question-list'),
    path('questions/editor/', views.question_editor, name='question-editor' ),
    path('questions/editor/<slug:qtype>/', views.question_editor_form, name='question-editor-type'),
    path('questions/editor/<slug:qtype>/<int:qid>/', views.question_editor_form),
    path('questions/test/', views.question_test),
    path('answer_sheet/<int:sectionID>/', views.answer_sheet),
#    path('delete/<int:notice_id>/', views.delete_notice),
#    path('get/', views.get_notices),
]

