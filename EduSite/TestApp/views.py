from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def test_session(request):
    sid = request.session['_auth_user_id']
#    print(sid.len)
    return HttpResponse("Testing Session: " +sid)