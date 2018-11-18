from django.urls import path

from . import views

app_name = 'CourseFunApp'
urlpatterns = [
    path('questions/remooove/<slug:qtype>/<int:qid>/', views.delete_question, name='question-delete'),
    path('questions/list/all/', views.get_all_list, name='question-all'),
    path('questions/list/ids/', views.get_question_list_by_ids, name='question-list-ids'),
    path('questions/list/<slug:qtype>/', views.get_type_question_list, name='question-list'),
    path('questions/list/<slug:qtype>/<int:section_id>/', views.get_type_question_list, name='question-list-section'),
    path('questions/editor/', views.question_editor, name='question-editor' ),
    path('questions/editor/<slug:qtype>/', views.question_editor_form, name='question-editor-type'),
    path('questions/editor/<slug:qtype>/<int:qid>/', views.question_editor_form),
    path('questions/import/', views.question_import, name='question-importer'),
    path('answer_sheet/<int:sectionID>/', views.answer_sheet, name='answer-sheet'),
    path('lesson/editor/', views.lesson_editor, name='lesson_editor'),
    path('lesson/delete/<int:lesson_content_id>/', views.lesson_delete, name='lesson_delete'),
    path('lesson/contentclasschange/<int:lesson_content_id>/', views.lesson_content_class_change, name='lesson_content_class_change'),
    path('study/<int:lesson_id>/', views.study, name='study'),
    path('exam/editor/', views.exam_editor, name='exam_editor'),
    path('exam/editor/history/', views.exam_editor_hitory, name='exam_editor_history'),
    path('exam/nearest/', views.exam_ready, name='exam_ready'),
    path('exam/<int:exam_id>/', views.exam_examination, name='exam_current'),
    path('exam_answer/<int:examans_id>/', views.exam_answer, name='exam_answer'),
    path('exam/voice/<int:student_id>/<int:exam_id>/', views.exam_voice_answer, name='exam_voice_answer'),
    path('exam/addition/<int:examans_id>/', views.exam_addition_score, name='exam_addition_score'),
    path('class/setting/', views.class_setting, name='class_setting'),
    path('class/prac/<int:class_id>/', views.class_prac, name='class_prac'),
#    path('delete/<int:notice_id>/', views.delete_notice),
#    path('get/', views.get_notices),
]