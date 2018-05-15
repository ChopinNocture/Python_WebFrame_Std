from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

import CourseFunApp.models as appModels

# from django.utils.dateformat import DateFormat
# from django.utils import timezone


#--------------------------------------------------------
# public notice now
def get_question_list(request, qtype):
   # package = __import__('\\.models')
    temp_class = getattr(appModels, qtype)
    questList = temp_class.objects.all()
    return HttpResponse(questList)
