from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.forms import ModelForm

# Create your views here.

import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms
import CourseFunApp.exam_system as exam_sys

# from django.utils.dateformat import DateFormat
# from django.utils import timezone


# --------------------------------------------------------
#  
q_type_list = questionModels.get_qType_list()

# --------------------------------------------------------
# get question list by type
def get_question_list(request, qtype):
    try:
        temp_class = questionModels.get_qType_class(qtype)
    except (AttributeError) as e:
        print(e)
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

# editor main
def question_editor(request):
    course_list = list()
    i=0
    while i<10:
        course_list.append(TempCouse(id=i, name='Lesson '+ str(i)))
        i+=1
    
    return render(request=request, template_name="course/questionEditor.html", context={"qTypeList":q_type_list, "course_list":course_list})

# form part
def question_editor_form(request, qtype, qid=-1):
    # print("------------------" + q_type_list[0].get_url_name())
    try:
        formClass = questionForms.get_qForm_class(qtype)
    except (AttributeError) as e:
        # print(e)
        return HttpResponse(e)

    requestData = getattr(request, request.method)

    quest_in_DB = None
    if qid is not -1:
        try:
            temp_class = questionModels.get_qType_class(qtype)
        except (AttributeError) as e:
            print(e)
            return HttpResponse("Error type:" + qtype)

        try:
            quest_in_DB = temp_class.objects.get(id=qid)
        except (temp_class.MultipleObjectsReturned) as e:
            print(e + "Multiply objects get from:" + type(temp_class))
            return HttpResponse(e + "Multiply objects get from:" + type(temp_class))

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
            print("false!!!!!!!!!!!~~~~~~~~")
            return HttpResponse("False")

    elif request.method == "GET":
        retForm = formClass(instance=quest_in_DB)
        return render(request=request, template_name="course/QTypeForm.html", context={"form": retForm, "questionType": qtype})
    # return HttpResponse(temp_class.get_url_name())

# --------------------------------------------------------
# oprater for question
def question_test(request):    
    question_dict = exam_sys.generate_question_set()
    # print(json.dumps(question_dict))
    return JsonResponse(question_dict)

# --------------------------------------------------------
# answer sheet
def answer_sheet(request):
    return render(request=request, template_name="course/AnswerSheet.html", context={"form": "", "questionType": ""})