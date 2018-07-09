from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed
from django.template import loader
from django.forms import ModelForm
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError

# Create your views here.
from CourseFunApp.models import Lesson, Examination
import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms 
import CourseFunApp.exam_system as exam_sys

# from django.utils.dateformat import DateFormat
# from django.utils import timezone


# --------------------------------------------------------
# get question list by type
def get_question_list(request, qtype, section_id=None):
    try:
        temp_class = questionModels.get_qType_class(qtype)
    except (AttributeError) as e:
        print(e)
        return HttpResponse("Error type:" + qtype)

    if not request.is_ajax():
        return HttpResponse("Permission reject!")

    if section_id is None:
        quests = temp_class.objects.all().values('id', 'description', 'sectionID', 'flag')
    else:
        quests = temp_class.objects.filter(sectionID=section_id).values('id', 'description', 'sectionID', 'flag')

    quest_list = list()

    for qiter in quests:
        quest_list.append({"id": qiter['id'],
                           "desc": qiter['description'],
                           "secID": qiter['sectionID'],
                           "flag": qiter['flag']})

        # return render(request=request, template_name="home.html" )
    return JsonResponse(quest_list, safe=False)


# --------------------------------------------------------
# editor main
def question_editor(request):
    course_list = list()
    lesson_list = Lesson.objects.all()

    for iter in lesson_list:
        course_list.append({"id":iter.id, "name":iter.description})

    course_html = loader.render_to_string(template_name="course/course_list.html", context={"course_list": course_list})
    
    return render(request=request, template_name="course/questionEditor.html", context={"qTypeList": exam_sys.q_type_list, "course_html": course_html})


def delete_question(request, qtype, qid):
    # sid = request
    if not request.method == "POST" or not request.is_ajax():
        return HttpResponse("Permission reject!")

    try:
        temp_class = questionModels.get_qType_class(qtype)
    except (AttributeError) as e:
        print(e)
        return HttpResponse("Error type:" + qtype)

    try:
        temp_class.objects.filter(id=qid).delete()
    except Exception as e:
        print(e + type(temp_class))
        return HttpResponse(e + "--" + type(temp_class))

    return HttpResponse("Succeed!", status=200)


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
        print(" -- "+requestData["sectionID"])
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
# oprater for lesson
def lesson_editor(request):
    return HttpResponse('Lesson Editor')


def lesson_content(request, lesson_id):
    return HttpResponse('hello')


def study(request, lesson_id):
    return HttpResponse('Lesson Study')


# --------------------------------------------------------
# answer sheet
def answer_sheet(request, sectionID):
    lesson = Lesson.objects.get(id=sectionID)
    if request.method == "GET":
        print(request.method)
        return render(request=request, template_name="course/AnswerSheet.html", context={"section_name": lesson.description, "questionType": ""})
    else:
        print("-`-`-`-`"+request.method)
        question_dict = exam_sys.generate_question_set(lesson)
        return JsonResponse(question_dict)
    

# --------------------------------------------------------
# examination
def exam_editor(request):
    if request.is_ajax() and request.method == "POST":
        exam = Examination()
        # exam = Examination.objects.create(
        #     title = 'test',
        #     duration = 120,
        #     question_list = {"email": "to1@example.com"}
        # )
        # exam.save()
        
        exam_form = questionForms.ExaminationForm(request.POST, instance=exam)
        try:
            if exam_form.is_valid():
                print("???")
                exam = exam_form.save(commit=False)
                print(exam)
                exam.save()
            else:
                print(exam_form.errors.as_data())
        except Exception as e:
            print("-----" + str(e))
            print(exam_form.cleaned_data)
            print(exam_form.errors.as_data())
            return HttpResponseNotAllowed("F!")

            
        return HttpResponse("Success!")
        
    elif request.method == "GET":
        course_list = list()
        lesson_list = Lesson.objects.all()

        for iter in lesson_list:
            course_list.append({"id": iter.id, "name": iter.description})

        course_html = loader.render_to_string(template_name="course/course_list.html", context={"course_list": course_list})
        
        exam_form = questionForms.ExaminationForm()

        return render(request=request, template_name="course/examination_editor.html", context={"qTypeList": exam_sys.q_type_list, "course_html": course_html, "form": exam_form })
    
    
def exam_ready(request):
    return HttpResponse('Lesson Study')