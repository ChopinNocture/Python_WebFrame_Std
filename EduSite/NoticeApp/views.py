from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from datetime import timedelta
from django.conf import settings

# Create your views here.
from .models import Notices
from .forms import NoticesForm
#from django.utils.dateformat import DateFormat
from AccountApp.decorators import course_required

#--------------------------------------------------------
# public notice now
@course_required()
def public_notice_now(request, content):
    today = timezone.datetime.today()
    return public_notice(request, today.year, today.month, today.day, 3, content)


# public notice by time
@course_required()
def public_notice(request, year, month, day, duration):
    # sid = request
    if not request.method == "POST" or not request.is_ajax():
        return HttpResponse("Permission reject!")

    content = request.POST.get('content')
    publicDate = timezone.datetime(year=year, month=month, day=day).date()
    newNotice = Notices(        
        publicDate = publicDate,
        expireDate = publicDate + timedelta(duration),
        content = content,
    )
    newNotice.save(using=request.db_name)

    return HttpResponse("Succeed!", status=200)


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def public_notice_form(request):
    history_list = Notices.objects.using(request.db_name).filter(expireDate__gt=timezone.now())
    noticeform = NoticesForm()

    if request.method == "GET":
        return render(request=request, 
            template_name='notice/notice_editor.html', 
            context={'form': noticeform, 'notice_list':history_list, 'course_desc':request.course_desc,})


#--------------------------------------------------------
# get notices by time
@course_required()
def get_notices(request, fromDate=timezone.now(), expireDate=timezone.now()):
    if request.method == "GET" and request.is_ajax():
        currentNotices = Notices.objects.using(request.db_name).filter(publicDate__lte=fromDate, expireDate__gt=expireDate)
        
        notices_list = list()
        for iter in currentNotices:
            notices_list.append({"id":iter.id, "content":iter.content}) 

        return JsonResponse(notices_list, safe=False)
    
    httpRsp = HttpResponse(currentNotices)    
    return httpRsp


# get notices by time
@course_required()
def get_notice_content(request, notice_id):
    noticeContent = Notices.objects.using(request.db_name).get(id=notice_id)    
    return JsonResponse(noticeContent.content, safe=False)


#--------------------------------------------------------
# delete notices by ID
@course_required()
def delete_notice(request, notice_id):
    Notices.objects.using(request.db_name).get(id=notice_id).delete()
    return HttpResponse()