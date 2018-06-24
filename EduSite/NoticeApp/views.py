from django.shortcuts import render
from django.http import HttpResponse
from datetime import timedelta

# Create your views here.
from .models import Notices
from .forms import NoticesForm
#from django.utils.dateformat import DateFormat
from django.utils import timezone


#--------------------------------------------------------
# public notice now
def public_notice_now(request, content):
    today = timezone.datetime.today()
    return public_notice(request, today.year, today.month, today.day, 3, content)

# public notice by time
def public_notice(request, year, month, day, duration):
    # sid = request
    if not request.method == "POST" or not request.is_ajax():
        return HttpResponse("Permission reject!")

    content = request.POST.get('content')
    publicDate = timezone.datetime(year=year, month=month, day=day).date()
    newNotice = Notices.objects.create(
        publicDate = publicDate,
        expireDate = publicDate + timedelta(duration),
        content = content
    )

    return HttpResponse("Succeed!", status=200)


def public_notice_form(request):
    history_list = Notices.objects.filter(expireDate__gt=timezone.now())
    noticeform = NoticesForm()

    if request.method == "GET":
        return render(request=request, 
        template_name='notice/notice_editor.html', 
        context={'form': noticeform, 'notice_list':history_list})


#--------------------------------------------------------
# get notices by time
def get_notices(request, fromDate=timezone.now(), expireDate=timezone.now()):
    currentNotices = Notices.objects.filter(publicDate__lte=fromDate, expireDate__gt=expireDate)
    httpRsp = HttpResponse(currentNotices)

    return httpRsp


#--------------------------------------------------------
# delete notices by ID
def delete_notice(request, notice_id):
    Notices.objects.get(id=notice_id).delete()
    return HttpResponse()