from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.forms.models import model_to_dict
from .models import *

# Create your views here.

def test_session(request):
    # sid = request.session['_auth_user_id']
    retList = []    
    for iter in TestData.objects.all():
        retList.append(model_to_dict(iter))
    
    print(type(retList))

#    print(sid.len)
    return JsonResponse({"objlist":retList})

def test_teacher(request):    
    return render(request=request, template_name="teacher_main.html")