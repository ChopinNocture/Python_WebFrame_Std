from django.shortcuts import render
from django.http import HttpResponse
from django.forms import ModelForm

# Create your views here.

import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms

# from django.utils.dateformat import DateFormat
# from django.utils import timezone


# --------------------------------------------------------
# public notice now
Q_TYPE_SUFFIX = 'Question'
Q_FORM_SUFFIX = 'Form'

q_type_list = questionModels.Question.__subclasses__()

# --------------------------------------------------------
# get question list by type
def get_question_list(request, qtype):
    #   package = __import__('\\.models')
    temp_class = getattr(questionModels, qtype + Q_TYPE_SUFFIX)
    if not issubclass(temp_class, questionModels.Question):
        return HttpResponse("Error type:" + qtype)

    questList = temp_class.objects.all()
    # return render(request=request, template_name="home.html" )

    return HttpResponse(questList)


# --------------------------------------------------------
# editor for question
def question_editor(request, qtype, qid=-1):
    print("------------------" + q_type_list[0].get_url_name())
    formClass = getattr(questionForms, qtype + Q_FORM_SUFFIX)

    if not issubclass(formClass, ModelForm):
        return HttpResponse("Error type:" + qtype)

    requestData = getattr(request, request.method)

    quest_in_DB = None
    if qid is not -1:
        temp_class = getattr(questionModels, qtype + Q_TYPE_SUFFIX)
        if issubclass(temp_class, questionModels.Question):
            quest_in_DB = temp_class.objects.get(id=qid)

    if request.method == "POST":
        newQuestForm = formClass(requestData, instance=quest_in_DB)

        if newQuestForm.is_valid():
            newQuestForm.save()
            #            quest_in_DB = newQuestForm.save(commit=False)
            #            formData = newQuestForm.cleaned_data
            #            for iter in newQuestForm.fields:
            #                print(iter)
            #                setattr(quest_in_DB, iter, formData[iter])
            #            quest_in_DB.save()
            print("Succeed")
            return HttpResponse("Succeed")
        else:
            print("fals!!!!!!!!!!!~~~~~~~~")
            return HttpResponse("False")

    elif request.method == "GET":
        retForm = formClass(instance=quest_in_DB)
        print("!!!!!!!!!!!~~~~~~~~")
        return render(request=request, template_name="course/questionEditor.html", context={"form": retForm, "qTypeList":q_type_list})
    # return HttpResponse(temp_class.get_url_name())


