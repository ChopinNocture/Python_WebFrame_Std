from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
from .models import Notices
from django.utils.dateformat import DateFormat
from django.utils import timezone

# public notice by time   year>/<int:month>/<int:day>/<int:duration>/<slug:content
def public_notice(request, year=2018, month=5, day=1, duration=10, content='testString'):
    # sid = request
#    print(sid.len)

    newNotice = Notices.objects.create(
        publicDate = timezone.datetime( year=year, month=month, day=day ),
        content = content )
    return HttpResponse("Testing Session: ")