import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed, QueryDict
from django.template import loader
from django.forms import ModelForm
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError
from django.core.files.uploadhandler import TemporaryFileUploadHandler
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.forms.models import model_to_dict

# Create your views here.
from CourseFunApp.models import Lesson, Examination
import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms
import CourseFunApp.exam_system as exam_sys
import CourseFunApp.database_tool as DB_tool
from AccountApp.decorators import course_required
from AccountApp import COURSE_KEY

# from django.utils.dateformat import DateFormat
from django.utils import timezone

# --------------------------------------------------------
# get all type
@course_required()
def get_all_list(request):
    if not request.db_name:
        return HttpResponse("Permission reject!")

    if request.method == "POST" and request.is_ajax():
        jsonObj = request.POST.get("jsonObj")
        typeListObj = json.loads(s=jsonObj)

        print(typeListObj, "-----------")

        quest_all = dict()
        for qtype in typeListObj["typelist"]:
            try:
                temp_class = questionModels.get_qType_class(qtype)
                quest_list = list()
                quests = temp_class.objects.using(request.db_name).all().values('id', 'description', 'sectionID', 'flag')           

                for qiter in quests:
                    quest_list.append({"id": qiter['id'],
                                    "desc": qiter['description'],
                                    "secID": qiter['sectionID'],
                                    "flag": qiter['flag']})
                quest_all[qtype] = quest_list
            except (AttributeError) as e:
                print(e)
                continue
        return JsonResponse(quest_all, safe=False)

    return HttpResponse("Permission reject!")


# get question list by type
@course_required()
def get_type_question_list(request, qtype, section_id=None):
    try:
        temp_class = questionModels.get_qType_class(qtype)
    except (AttributeError) as e:
        print(e)
        return HttpResponse("Error type:" + qtype)

    if not request.is_ajax():
        return HttpResponse("Permission reject!")

    if section_id is None:
        quests = temp_class.objects.using(request.db_name).all().values('id', 'description', 'sectionID', 'flag')
    else:
        quests = temp_class.objects.using(request.db_name).filter(sectionID=section_id).values('id', 'description', 'sectionID', 'flag')

    quest_list = list()

    for qiter in quests:
        quest_list.append({"id": qiter['id'],
                           "desc": qiter['description'],
                           "secID": qiter['sectionID'],
                           "flag": qiter['flag']})

        # return render(request=request, template_name="home.html" )
    return JsonResponse(quest_list, safe=False)


# get question list by type from id list
@course_required()
def get_question_list_by_ids(request):
    if request.method == "POST" and request.is_ajax():
        try:            
            typeListObj = json.loads(s=request.POST.get("jsonlist"))
            # print(typeListObj, " ---  ", request.POST.get("qtype"), )
            jsondata = exam_sys.get_questions_by_id_list(request.POST.get("qtype"), typeListObj['qlist'], request.db_name)
            return JsonResponse(jsondata, safe=False)
        except (AttributeError) as e:
            print(e)
            return HttpResponse(e)


# --------------------------------------------------------
# editor main
@login_required(login_url='/user/login/')
@course_required()
def question_editor(request):
    course_html = get_lesson_list_html(request)
    
    return render(request=request, template_name="course/questionEditor.html",
                  context={"qTypeList": exam_sys.q_type_list, "course_html": course_html, 'course_desc':request.course_desc})


@course_required()
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
        temp_class.objects.using(request.db_name).filter(id=qid).delete()
    except Exception as e:
        print(e + type(temp_class))
        return HttpResponse(e + "--" + type(temp_class))

    return HttpResponse("Succeed!", status=200)


# form part
@course_required()
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
            quest_in_DB = temp_class.objects.using(request.db_name).get(id=qid)
        except (temp_class.MultipleObjectsReturned) as e:
            print(e + "Multiply objects get from:" + type(temp_class))
            return HttpResponse(e + "Multiply objects get from:" + type(temp_class))

    if request.method == "POST":
        print(" -- " + requestData["sectionID"])
        newQuestForm = formClass(requestData, instance=quest_in_DB)

        if newQuestForm.is_valid():
            quest_in_DB = newQuestForm.save(commit=False)
            quest_in_DB.save(using='course_A')
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


@login_required(login_url='/user/login/')
@course_required()
@csrf_exempt
def question_import(request):
    if request.method == "POST":
        temp_file_loader = TemporaryFileUploadHandler(request)
        request.upload_handlers = [temp_file_loader]

        return _question_import(request)
    elif request.method == "GET":      
        return render(
            request=request, 
            template_name="course/Question_Importer.html", 
            context={"suc_info" : "hidden", 'fail_info' : "hidden", 'course_desc':request.course_desc}
        )


@csrf_protect
def _question_import(request):  
    file = request.FILES['excel']
    print(file.temporary_file_path())

    if request.POST['op'] == 'ListImport':
        DB_tool.import_lesson_list(file.temporary_file_path(), request.db_name)
    else:
        try:
            DB_tool.update_DB_from_excel(file.temporary_file_path(), request.db_name)
        except Exception as e:
            print(e)
            return render(
                request=request, 
                template_name="course/Question_Importer.html", 
                context={"suc_info" : "hidden", 'fail_info' : "", 'course_desc':request.course_desc}
            )    

    return render(
        request=request, 
        template_name="course/Question_Importer.html", 
        context={"suc_info" : "", 'fail_info':"hidden", 'course_desc':request.course_desc}
    )


# --------------------------------------------------------
# oprater for lesson
@login_required(login_url='/user/login/')
@course_required()
def lesson_editor(request):
    course_html = get_lesson_list_html(request)

    if request.method == "GET":
        lesson_id = request.GET.get("lesson")

        if lesson_id:
            try:
                lesson_cont = questionForms.LessonContent.objects.using(request.db_name).get(lesson=lesson_id)
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
                          context={"lesson_form_html": form_html, "course_html": course_html, 'course_desc':request.course_desc })

    elif request.method == "POST":
        lesson_id = request.POST.get("lesson")

        try:
            lesson_cont = questionForms.LessonContent.objects.using(request.db_name).get(lesson=lesson_id)
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
                      context={"lesson_form_html": form_html, "course_html": course_html, 'course_desc':request.course_desc })


@course_required()
def get_lesson_content(request, lesson_id):
    return HttpResponse('hello')


# --------------------------------------------------------
# study lesson
@login_required(login_url='/user/login/')
@course_required()
def study(request, lesson_id):
    if request.method == "GET":
        try:
            lesson = Lesson.objects.using(request.db_name).get(id=lesson_id)
            description = lesson.description
            lesson_content = questionForms.LessonContent.objects.using(request.db_name).get(lesson=lesson_id)
            
        except Exception as e:
            description = lesson.description
            lesson_content = None
            print(' --- ' + str(e))

        return render(request=request,
                    template_name="course/StudyLesson.html",
                    context = {"lesson_content": lesson_content,
                            "section_name": description,  
                            "progress":request.GET.get("progress")})

    return HttpResponse('hello')


# --------------------------------------------------------
# answer sheet
@login_required(login_url='/user/login/')
@course_required()
def answer_sheet(request, sectionID):
    lesson = Lesson.objects.using(request.db_name).get(id=sectionID)
    if request.method == "GET":
        return render(request=request, template_name="course/AnswerSheet.html",
                    context = {"section_name": lesson.description, 
                                "unlock_number": questionModels.UNLOCK_NUMBER,
                                "progress": request.GET.get("progress")})
    else:
        question_dict = exam_sys.generate_question_set(request.db_name, lesson, 3)
        return JsonResponse(question_dict)


# --------------------------------------------------------
# examination
@login_required(login_url='/user/login/')
@course_required()
def exam_examination(request, exam_id):
    if request.method == "GET":
        try:
            exam = Examination.objects.using(request.db_name).get(id=exam_id)
        except Exception as e:
            print(e)
            exam = Examination()
        exam_form = questionForms.ExaminationForm(instance=exam)

        return render(request=request, template_name="course/Examination.html",
                    context = { "form": exam_form, 
                                "serv_time": str(timezone.now()),
                                "qTypeList": exam_sys.q_type_list })
    else:
        return HttpResponse('Lesson Study')


@login_required(login_url='/user/login/')
@course_required()
def exam_editor(request):
    if request.is_ajax() and request.method == "POST":
        exam = Examination()
        # exam = Examination.objects.using(request.db_name).create(
        #     title = 'test',
        #     duration = 120,
        #     question_list = {"email": "to1@example.com"}
        # )
        # exam.save()

        exam_form = questionForms.ExaminationForm(request.POST, instance=exam)
        try:
            if exam_form.is_valid():
                exam = exam_form.save(commit=False)
                exam.save(using=request.db_name)
            else:
                print(exam_form.errors.as_data())
                return HttpResponseNotAllowed(exam_form.errors.as_data())
        except Exception as e:
            print(e)
            print(exam_form.cleaned_data)
            print(exam_form.errors.as_data())
            return HttpResponseNotAllowed(e)

        return HttpResponse("Success!")

    elif request.method == "GET":
        exam_list = Examination.objects.using(request.db_name).all().values('id', 'start_time', 'title')
        exam_list_html = loader.render_to_string(template_name="course/exam_list.html",
                                                 context={"exam_list": exam_list})

        exam_form = questionForms.ExaminationForm()
        return render(request=request, template_name="course/examination_editor.html",
                      context={"qTypeList": exam_sys.q_type_list,
                               "exam_list_html": exam_list_html,
                               "course_html": get_lesson_list_html(request),
                               'course_desc':request.course_desc,
                               "form": exam_form})


@course_required()
def exam_editor_hitory(request):
    return HttpResponse('hahaha')


@course_required()
def exam_ready(request):
    exam = exam_sys.checkNearestExam(request.db_name)
    if exam:
        return JsonResponse(exam, safe=False)

    return HttpResponse('No Exam')


# --------------------------------------------------------
# tool func
@course_required()
def get_lesson_list_html(request):
    lesson_list = Lesson.objects.using(request.db_name).all().values('id', 'description')
    return loader.render_to_string(template_name="course/course_list.html", context={"lesson_list": lesson_list})


# --------------------------------------------------------
# class setting
@login_required(login_url='/user/login/')
@course_required()
def class_setting(request):
    lesson_list = Lesson.objects.using(request.db_name).all().values('id', 'description')
    return render(request=request, template_name="course/class_setting.html",
                    context = { "lesson_list": lesson_list,
                        'course_desc':request.course_desc, })

