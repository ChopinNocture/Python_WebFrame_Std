from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from datetime import timedelta
from django.conf import settings

# Create your views here.
# from .models import Notices
# from .forms import NoticesForm
#from django.utils.dateformat import DateFormat
from AccountApp.decorators import course_required

# Create your views here.
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def get_statistic(request):

    if request.method == "GET":
        return render(request=request,
                      template_name='statistic/statistic_main.html',)
                      #context={'form': noticeform, 'notice_list': history_list, 'course_desc': request.course_desc, })