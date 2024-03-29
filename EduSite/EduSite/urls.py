"""EduSite URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

import django_cas_ng.views

from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static
import AccountApp.views


urlpatterns = [
    path('', AccountApp.views.user_login ),
    path('admin/', admin.site.urls),
    path('notice/', include('NoticeApp.urls', namespace='notice')),
    path('course/', include('CourseFunApp.urls', namespace='course')),
    path('user/', include('AccountApp.urls', namespace='user')),
    path('accounts/login/', django_cas_ng.views.LoginView.as_view(), name='cas_ng_login'),
    path('accounts/logout/', django_cas_ng.views.LogoutView.as_view(), name='cas_ng_logout'),
    url(r'^accounts/callback$', django_cas_ng.views.CallbackView.as_view(), name='cas_ng_proxy_callback'),
    path('sync/', include('UserInfoSync.urls')),
    path('statistic/', include('StatisticApp.urls', namespace='statistic')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
