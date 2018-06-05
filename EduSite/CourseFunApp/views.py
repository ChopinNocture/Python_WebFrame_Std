from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
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

    if not request.is_ajax():
        return HttpResponse("Only support ajax Get!")

    quests = temp_class.objects.all()
    quest_list = list()

    for iter in quests:
        quest_list.append({"id":iter.id, "desc":iter.description}) 

    # return render(request=request, template_name="home.html" )
    return JsonResponse(quest_list, safe=False)

# --------------------------------------------------------
# editor for question
class TempCouse(object):
    id = 0
    name = 'Lesson'
    def __init__(self, id, name):
        self.id = id
        self.name = name

def question_editor(request):
    course_list = list()
    i=0
    while i<10:
        course_list.append(TempCouse(id=i, name='Lesson '+ str(i)))
        i+=1
    
    return render(request=request, template_name="course/questionEditor.html", context={"qTypeList":q_type_list, "course_list":course_list})

# form part
def question_editor_form(request, qtype, qid=-1):
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
        return render(request=request, template_name="course/QTypeForm.html", context={"form": retForm, "questionType": qtype})
    # return HttpResponse(temp_class.get_url_name())


