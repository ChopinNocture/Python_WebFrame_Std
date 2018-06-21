from django.urls import path

from django.contrib.auth import views as auth_views

from . import views

app_name = 'AccountApp'
urlpatterns = [
    path('student/', views.student_main, name='student'),
    path('teacher/', views.teacher_main, name='teacher'),
    path('login/', views.user_login, name='login'),
    # path('login/', auth_views.login, name='login')
    path('student_manager/', views.student_manager, name='student_manager'),
    path('<int:student_id>/student_prof/', views.get_student_prof, name='student_prof')
    
    # path('questions/editor/<slug:qtype>/', views.question_editor_form, name='question-editor-type'),
    # path('questions/editor/<slug:qtype>/<int:qid>/', views.question_editor_form),
    # path('questions/test/', views.question_test),
    # path('answer_sheet/<int:sectionID>/', views.answer_sheet),
]
