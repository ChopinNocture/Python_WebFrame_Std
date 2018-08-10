from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed, QueryDict
from django.template import loader
from django.forms import ModelForm
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError
from django.core.files.uploadhandler import TemporaryFileUploadHandler
from django.views.decorators.csrf import csrf_exempt, csrf_protect

# Create your views here.
from CourseFunApp.models import Lesson, Examination
import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms
import CourseFunApp.exam_system as exam_sys
import CourseFunApp.database_tool as DB_tool


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
    course_html = get_lesson_list_html()

    return render(request=request, template_name="course/questionEditor.html",
                  context={"qTypeList": exam_sys.q_type_list, "course_html": course_html})


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
        print(" -- " + requestData["sectionID"])
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
        return render(request=request, template_name="course/QTypeForm.html",
                      context={"form": retForm, "questionType": qtype})
    # return HttpResponse(temp_class.get_url_name())


@csrf_exempt
def question_import(request):
    if request.method == "POST":
        temp_file_loader = TemporaryFileUploadHandler(request)
        request.upload_handlers = [temp_file_loader]

    return _question_import(request)


@csrf_protect
def _question_import(request):
    if request.method == "POST":        
        file = request.FILES['excel']
        print(file.temporary_file_path())
        try:
            DB_tool.update_DB_from_excel(file.temporary_file_path())
        except Exception as e:
            print(e)
            return render(
                request=request, 
                template_name="course/Question_Importer.html", 
                context={"suc_info" : "hidden", 'fail_info' : ""}
            )    
        return render(
            request=request, 
            template_name="course/Question_Importer.html", 
            context={"suc_info" : "", 'fail_info':"hidden"}
        )

    elif request.method == "GET":        
        return render(
            request=request, 
            template_name="course/Question_Importer.html", 
            context={"suc_info" : "hidden", 'fail_info' : "hidden"}
        )


# --------------------------------------------------------
# oprater for lesson
def lesson_editor(request):
    course_html = get_lesson_list_html()

    if request.method == "GET":
        lesson_id = request.GET.get("lesson")

        if lesson_id:
            try:
                lesson_cont = questionForms.LessonContent.objects.get(lesson=lesson_id)
                lesson_content_form = questionForms.LessonContentForm(instance=lesson_cont,
                                                                      initial={'file_name': lesson_cont.file})

            except Exception as e:
                lesson_content_form = questionForms.LessonContentForm(instance=None, initial={'lesson': lesson_id})
                print(' --- ' + str(e))

            return render(request=request, template_name="course/lesson_form.html",
                          context={"form": lesson_content_form})
        else:
            lesson_content_form = questionForms.LessonContentForm()

            form_html = loader.render_to_string(template_name="course/lesson_form.html",
                                                context={"form": lesson_content_form})
            return render(request=request,
                          template_name="course/lesson_editor.html",
                          context={"lesson_form_html": form_html, "course_html": course_html, })

    elif request.method == "POST":
        lesson_id = request.POST.get("lesson")

        try:
            lesson_cont = questionForms.LessonContent.objects.get(lesson=lesson_id)
        except Exception as e:
            print(' --- ' + str(e))
            lesson_cont = None

        lesson_content_form = questionForms.LessonContentForm(request.POST, request.FILES, instance=lesson_cont)

        print(str(lesson_id) + " - " + str(request.FILES))
        try:
            if lesson_content_form.is_valid():
                # less_con = lesson_content_form.cleaned_data
                less_con = lesson_content_form.save()
            else:
                print(lesson_content_form.errors.as_data())
                return HttpResponseNotAllowed("Wrong!")
        except Exception as e:
            print(e)
            print(lesson_content_form.cleaned_data)
            print(lesson_content_form.errors.as_data())
            return HttpResponseNotAllowed("F!")

        form_html = loader.render_to_string(template_name="course/lesson_form.html",
                                            context={"form": lesson_content_form})
        return render(request=request,
                      template_name="course/lesson_editor.html",
                      context={"lesson_form_html": form_html, "course_html": course_html, })


def get_lesson_content(request, lesson_id):
    return HttpResponse('hello')


def study(request, lesson_id):
    return HttpResponse('Lesson Study')


# --------------------------------------------------------
# answer sheet
def answer_sheet(request, sectionID):
    lesson = Lesson.objects.get(id=sectionID)
    if request.method == "GET":
        return render(request=request, template_name="course/AnswerSheet.html",
                      context={"section_name": lesson.description, "questionType": ""})
    else:
        question_dict = exam_sys.generate_question_set(lesson, 1, ['Choice'])
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
                exam = exam_form.save(commit=False)
                exam.save()
            else:
                print(exam_form.errors.as_data())
        except Exception as e:
            print(e)
            print(exam_form.cleaned_data)
            print(exam_form.errors.as_data())
            return HttpResponseNotAllowed("F!")

        return HttpResponse("Success!")

    elif request.method == "GET":
        exam_list = Examination.objects.all().values('id', 'start_time', 'title')
        exam_list_html = loader.render_to_string(template_name="course/exam_list.html",
                                                 context={"exam_list": exam_list})

        exam_form = questionForms.ExaminationForm()
        return render(request=request, template_name="course/examination_editor.html",
                      context={"qTypeList": exam_sys.q_type_list,
                               "exam_list_html": exam_list_html,
                               "course_html": get_lesson_list_html(),
                               "form": exam_form})


def exam_editor_hitory(request):
    return HttpResponse('hahaha')


def exam_ready(request):
    return HttpResponse('Lesson Study')


# --------------------------------------------------------
# tool func
def get_lesson_list_html():
    lesson_list = Lesson.objects.all().values('id', 'description')
    return loader.render_to_string(template_name="course/course_list.html", context={"lesson_list": lesson_list})
