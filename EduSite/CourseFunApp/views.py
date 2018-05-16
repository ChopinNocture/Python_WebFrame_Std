from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms

# from django.utils.dateformat import DateFormat
# from django.utils import timezone


# --------------------------------------------------------
# public notice now
Q_TYPE_SUFFIX = 'Question'
Q_FORM_SUFFIX = 'Form'


# --------------------------------------------------------
# public notice now
def get_question_list(request, qtype):
    #   package = __import__('\\.models')
    temp_class = getattr(questionModels, qtype + Q_TYPE_SUFFIX)
    questList = temp_class.objects.all()
    # return render(request=request, template_name="home.html" )

    return HttpResponse(questList)


def question_editor(request, qtype):
    formClass = getattr(questionForms, qtype + Q_FORM_SUFFIX)
    retForm = formClass()

    # return HttpResponse(retForm)
    return render(request=request, template_name="home.html", context={"form": retForm})

    # return HttpResponse(temp_class.get_url_name())
