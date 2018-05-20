from django.shortcuts import render
from django.http import HttpResponse

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
def public_notice(request, year, month, day, duration, content):
    # sid = request
    newNotice = Notices.objects.create(
        publicDate = timezone.datetime(year=year, month=month, day=day).date(),
        expireDate = timezone.datetime(year=year, month=month, day=day+duration).date(),
        content = content
    )

    return HttpResponse("Testing Session: ")


def public_notice_form(request):
    noticeform = NoticesForm()

    if request.method == "GET":
        return render(request=request, context={"form": noticeform})


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