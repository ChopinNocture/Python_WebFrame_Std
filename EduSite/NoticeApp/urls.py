from django.urls import path

from . import views
urlpatterns = [
    path('public/', views.public_notice_form),
    path('public/<int:year>/<int:month>/<int:day>/<int:duration>/<slug:content>/', views.public_notice),
    path('public/now/<slug:content>/', views.public_notice_now),
    path('delete/<int:notice_id>/', views.delete_notice),
    path('get/', views.get_notices),
]

