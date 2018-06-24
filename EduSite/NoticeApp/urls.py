from django.urls import path

from . import views

app_name = 'NoticeApp'
urlpatterns = [
    path('public/', views.public_notice_form, name='public'),
    path('public/<int:year>/<int:month>/<int:day>/<int:duration>/', views.public_notice),
    path('public/now/<slug:content>/', views.public_notice_now),
    path('delete/<int:notice_id>/', views.delete_notice, name='delete'),
    path('get/', views.get_notices),
]

