from django.urls import path

from . import views

urlpatterns = [
    path('public/<int:year>/<int:month>/<int:day>/<int:duration>/<slug:content>/', views.public_notice),
]