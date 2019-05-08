import json
import os
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed, HttpResponseRedirect, QueryDict
from django.template import loader
from django.forms import ModelForm
from django.core.exceptions import NON_FIELD_ERRORS, ValidationError, ObjectDoesNotExist
from django.core.files.uploadhandler import TemporaryFileUploadHandler
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.forms.models import model_to_dict
from django.conf import settings

# Create your views here.
from CourseFunApp.models import Lesson, Examination, ClassSetting, ExamAnswer
import CourseFunApp.models as questionModels
import CourseFunApp.forms as questionForms
import CourseFunApp.exam_system as exam_sys
import CourseFunApp.database_tool as DB_tool
from AccountApp.decorators import course_required
from AccountApp import COURSE_KEY
from AccountApp.models import ClassInfo, StudentProf, StudentProgressInfo
from AccountApp.views import is_admin_teacher

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

            jsondata = exam_sys.get_questions_by_id_list(request.POST.get("qtype"), typeListObj['qlist'], request.db_name)
            return JsonResponse(jsondata, safe=False)
        except (AttributeError) as e:
            print(e)
            return HttpResponse(e)


# --------------------------------------------------------
# editor main
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def question_editor(request):
    course_html = get_lesson_list_html(request)
    
    return render(request=request, template_name="course/questionEditor.html",
                  context={"qTypeList": exam_sys.q_type_list, "course_html": course_html, 'course_desc': request.course_desc, 'is_admin': is_admin_teacher(request.user)})


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


@course_required()
def delete_question_list(request, qtype):
    if not request.method == "POST" or not request.is_ajax():
        return HttpResponse("Permission reject!")
    
    try:
        temp_class = questionModels.get_qType_class(qtype)
    except (AttributeError) as e:
        print(e)
        return HttpResponse("Error type:" + qtype)
    
    q_list = json.loads(s=request.POST.get('q_list'))
    
    for iter in q_list:
        try:
            temp_class.objects.using(request.db_name).filter(id=iter).delete()
        except Exception as e:
            print(e + type(temp_class))

    print("----")
    return JsonResponse({"suc":"yes"})


# form part
@course_required()
def question_editor_form(request, qtype, qid=-1):
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
        newQuestForm = formClass(requestData, request.FILES, instance=quest_in_DB)        
        if newQuestForm.is_valid():
            quest_in_DB = newQuestForm.save(commit=False)
            quest_in_DB.sectionID = questionModels.Lesson.objects.using(request.db_name).get(id=requestData["sectionID"])
            print("-----", quest_in_DB)
            if hasattr(quest_in_DB, 'qVoice'):
                print(quest_in_DB.qVoice)
            quest_in_DB.save(using=request.db_name)
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
        sectionID = -1
        if quest_in_DB:
            sectionID = quest_in_DB.sectionID.id
            
        retForm = formClass(instance=quest_in_DB, initial={"sectionID": sectionID})
        return render(request=request, template_name="course/QTypeForm.html",
                      context={"form": retForm, "questionType": qtype, "quest_obj":quest_in_DB})
    # return HttpResponse(temp_class.get_url_name())


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
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
            context={"suc_info" : "hidden",
                     'fail_info' : "hidden",
                     "course_html": get_lesson_list_html(request),
                     'course_desc':request.course_desc,
                     "qTypeList": exam_sys.q_type_list,} 
        )


@csrf_protect
def _question_import(request):  
    file = request.FILES['excel']
    print(file.temporary_file_path())

    if request.POST['op'] == 'ListImport':
        DB_tool.import_lesson_list(file.temporary_file_path(), request.db_name)
    elif request.POST['op'] == 'normal':
        try:
            DB_tool.update_DB_from_excel(file.temporary_file_path(), request.db_name)
        except Exception as e:
            print(e)
            return render(
                request = request, 
                template_name = "course/Question_Importer.html", 
                context = {"course_html": get_lesson_list_html(request), "suc_info" : "hidden", 'fail_info' : "", 'course_desc':request.course_desc})    
    elif request.POST['op'] == 'check':
        valid, check_string = DB_tool.check_question_excel(file.temporary_file_path(), request.db_name)
        return render(request=request, 
                template_name = "course/Question_Importer.html", 
                context = {
                        "qTypeList": exam_sys.q_type_list, 
                        "course_html": get_lesson_list_html(request),
                        "suc_info" : "hidden", 
                        'chk_valid': valid,
                        'chk_string': check_string,
                        'fail_info': "hidden", 
                        "qTypeList": exam_sys.q_type_list, 
                        'course_desc': request.course_desc})

    return render(request=request, 
        template_name = "course/Question_Importer.html", 
        context = {"qTypeList": exam_sys.q_type_list, "course_html": get_lesson_list_html(request), "suc_info" : "", 'fail_info':"hidden", 'course_desc':request.course_desc})


# --------------------------------------------------------
# oprater for lesson
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def lesson_editor(request):
    course_html = get_lesson_list_html(request)
    class_list = ClassInfo.objects.all()

    if request.method == "GET":
        lesson_id = request.GET.get("lesson")
        content_id = request.GET.get("content_id")

        if lesson_id:
            try:
                lesson = questionModels.Lesson.objects.using(request.db_name).get(id=lesson_id)
            except Exception as e:
                print(' --- ' + str(e))

            if content_id:
                try:
                    lesson_cont = questionModels.LessonContent.objects.using(request.db_name).get(id=content_id)                
                    lesson_content_form = questionForms.LessonContentForm(instance=lesson_cont,
                                                                          initial={'lesson': lesson_id, 'file_name': lesson_cont.file})
                except Exception as e:
                    lesson_content_form = questionForms.LessonContentForm(instance=None, initial={'lesson': lesson_id})
                    print(' --- ' + str(e))
                return render(request=request, template_name="course/lesson_form.html",
                            context={"form": lesson_content_form, "content_id": content_id})
            else:
                less_cont_list = questionModels.LessonContent.objects.using(request.db_name).filter(lesson=lesson).values('id', 'file_type', 'content')
                for iter_cont in less_cont_list:
                    iter_cont['file_type'] = questionModels.MEDIA_CHOICES_DICT[iter_cont['file_type']]

                return render(request=request, template_name="course/lesson_content_list.html",
                            context={"less_cont_list": less_cont_list})

        else:
            lesson_content_form = questionForms.LessonContentForm()

            form_html = loader.render_to_string(template_name="course/lesson_form.html",
                                                context={"form": lesson_content_form, "content_id": content_id})
            return render(request=request,
                          template_name="course/lesson_editor.html",
                          context={"lesson_form_html": form_html, "course_html": course_html,
                                   'course_desc': request.course_desc, 'class_list': class_list, "is_admin": is_admin_teacher(request.user)})

    elif request.method == "POST":
        lesson_id = request.POST.get("lesson")
        content_id = request.POST.get("content_id")

        try:
            lesson = questionModels.Lesson.objects.using(request.db_name).get(id=lesson_id)
            lesson_cont = questionModels.LessonContent.objects.using(request.db_name).get(id=content_id)
        except Exception as e:
            print(' --- ' + str(e))
            lesson_cont = None

        lesson_content_form = questionForms.LessonContentForm(request.POST, request.FILES, instance=lesson_cont)

        print(str(lesson_id) + " - " + str(request.FILES))
        print(lesson_content_form)
        try:
            if lesson_content_form.is_valid():
                # lesson_cont = lesson_content_form.cleaned_data
                # formData = lesson_content_form.cleaned_data
                # for iter in lesson_content_form.fields:            
                #     setattr(lesson_cont, iter, formData[iter])
                lesson_cont = lesson_content_form.save(commit=False)
                lesson_cont.lesson = lesson
                lesson_cont.save(using=request.db_name)
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
                      context={"lesson_form_html": form_html, "course_html": course_html, 'course_desc': request.course_desc, 'class_list':class_list })


@course_required()
def lesson_content_class_change(request, lesson_content_id):
    if request.method == "POST":
        try:
            lesson_cont = questionModels.LessonContent.objects.using(request.db_name).get(id=lesson_content_id)
            class_list = request.POST.get("class_list")
            lesson_cont.class_id_list = class_list
            lesson_cont.save()
        except Exception as e:            
            return HttpResponseNotAllowed("F!")

    return HttpResponse('hello')


@course_required()
def lesson_delete(request, lesson_content_id):
    if not request.method == "POST" or not request.is_ajax():
        return HttpResponse("Permission reject!")

    try:
        questionModels.LessonContent.objects.using(request.db_name).get(id=lesson_content_id).delete()
    except Exception as e:
        print(e)
        return HttpResponse(e)

    return HttpResponse("Succeed!", status=200)


# --------------------------------------------------------
# study lesson
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def study(request, lesson_id):
    if request.method == "GET":
        try:
            stu_prof = StudentProf.objects.get(user=request.user)
            lesson = Lesson.objects.using(request.db_name).get(id=lesson_id)
            description = lesson.description
            lesson_content_list = questionModels.LessonContent.objects.using(request.db_name).filter(lesson=lesson_id).values("file_type", "file", "content", "class_id_list")            
        except Exception as e:
            description = lesson.description
            lesson_content_list = []
            print(' --- ' + str(e))

        return render(request=request,
                    template_name="course/StudyLesson.html",
                    context = {"lesson_content_list": lesson_content_list,
                            "class_id": stu_prof.class_id.id,
                            "section_name": description,  
                            "progress": request.GET.get("progress")})

    return HttpResponse('hello')


# --------------------------------------------------------
# answer sheet
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def answer_sheet(request, sectionID):
    lesson = Lesson.objects.using(request.db_name).get(id=sectionID)
    num_json = None
    id_list_json = None
    try:
        stu_prof = StudentProf.objects.get(user=request.user)
        cls_set = ClassSetting.objects.using(request.db_name).get(class_id=stu_prof.class_id.id)
        unlock_number = cls_set.unlock_number
        num_json = json.loads(s=cls_set.practise_setting)
        if not cls_set.quests_filter == 'none':
            id_list_json = json.loads(s=cls_set.quests_filter)
    except ObjectDoesNotExist as e:
        print(e)                
        unlock_number = questionModels.UNLOCK_NUMBER

    if request.method == "GET":
        return render(request=request, template_name="course/AnswerSheet.html",
                    context = {"section_name": lesson.description, 
                                "unlock_number": unlock_number,
                                "progress": request.GET.get("progress")})
    else:        
        question_dict = exam_sys.generate_question_set(db_name=request.db_name, sectionID=lesson, num_json=num_json, id_list_json=id_list_json, flag=0x01)
        return JsonResponse(question_dict)


# --------------------------------------------------------
# examination
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def exam_examination(request, exam_id):
    try:
        exam = Examination.objects.using(request.db_name).get(id=exam_id)
    except ObjectDoesNotExist as e:
        print(e)
        return HttpResponseNotAllowed(e)

    if request.method == "GET":        
        try:
            exam_answer = ExamAnswer.objects.using(request.db_name).get(exam=exam, user_id=request.user.id)
            return render(request=request, template_name="course/exam_finished.html",
                            context = { "hasanswer": True })
        except ObjectDoesNotExist as e:
            if timezone.now() > exam.end_time:
                return render(request=request, template_name="course/exam_finished.html",
                            context = { "hasanswer": False })
            else:
                exam_form = questionForms.ExaminationForm(instance=exam)
                return render(request=request, template_name="course/Examination.html",
                        context = { "user_id": request.user.id,
                                    "exam_id": exam_id,
                                    "form": exam_form, 
                                    "serv_time": str(timezone.now()),
                                    "qTypeList": exam_sys.q_type_list })
    else:
        if not request.is_ajax(): 
            return HttpResponse('failed')

        try:
            exam_answer = ExamAnswer.objects.using(request.db_name).get(exam=exam, user_id=request.user.id)
        except ObjectDoesNotExist as e:
            exam_answer = ExamAnswer(exam=exam, user_id=request.user.id)     

        print(request.POST['exam'])
        exam_answer.answer_json = request.POST['exam']
        exam_answer.score = request.POST['score']
        exam_answer.save(using=request.db_name)
        try:
            stu_prof = StudentProf.objects.get(user=request.user)
            cls_set = ClassSetting.objects.using(request.db_name).get(class_id=stu_prof.class_id.id)
            stu_pro = StudentProgressInfo.objects.using(request.db_name).get(user_id=request.user.id)
            stu_pro.gold = max(0, stu_pro.gold - cls_set.exam_ticket)
            stu_pro.save()
        except ObjectDoesNotExist as e:
            print(e)

        return JsonResponse({'url':'/user/student/'})


@course_required()
def exam_addition_score(request, examans_id):
    if request.is_ajax() and request.method == "POST":
        examAns = ExamAnswer.objects.using(request.db_name).get(id=examans_id)        
        print(request.POST['addition_score'])
        examAns.addition_score = request.POST['addition_score']
        examAns.save()
        return HttpResponse("Suc")


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
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
        class_list = ClassInfo.objects.all()
        exam_list = Examination.objects.using(request.db_name).all().values('id', 'start_time', 'end_time', 'title')
        exam_list_html = loader.render_to_string(template_name="course/exam_list.html",
                                                 context={"exam_list": exam_list})

        exam_form = questionForms.ExaminationForm()
        return render(request=request, template_name="course/examination_editor.html",
                      context={"qTypeList": exam_sys.q_type_list,
                               "exam_list_html": exam_list_html,
                               "course_html": get_lesson_list_html(request),
                               "class_list": class_list,
                               'course_desc': request.course_desc,
                               "form": exam_form})


@course_required()
def exam_editor_hitory(request):
    if request.method == "GET":
        class_list = ClassInfo.objects.all()
        exam_list = Examination.objects.using(request.db_name).filter(end_time__lt=timezone.now()).values('id', 'start_time', 'title')
        return render(request=request, template_name="course/exam_history.html",
                  context={ "class_list": class_list,
                            'course_desc': request.course_desc,
                            "exam_list": exam_list,
                            "is_admin": is_admin_teacher(request.user)})
    else:
        exam_id = request.POST['exam_id']
        query_exam_ans_list = ExamAnswer.objects.using(request.db_name).filter(
            exam=exam_id).values('exam', 'user_id', 'score', 'addition_score')
        exam_ans_list = list()
        for iter in query_exam_ans_list:
            exam_ans_list.append({'eid': iter['exam'], 'uid': iter['user_id'],
                                  'score': iter['score'], 'add_sc': iter['addition_score']})
        return JsonResponse({'exam_list': exam_ans_list})
        

@course_required()
def exam_answer(request, examans_id, stud_id=-1):
    if request.method == "GET":
        try:
            if stud_id==-1:
                stud_id = request.user

            stu_prof = StudentProf.objects.get(user=stud_id)
            exam_answer = ExamAnswer.objects.using(request.db_name).get(id=examans_id)
            exam_id = exam_answer.exam.id
            exam_form = questionForms.ExaminationForm(instance=exam_answer.exam)
            exam_answer_form = questionForms.ExamAnswerForm(instance=exam_answer)
        except Exception as e:
            print(e)
            return HttpResponseNotAllowed(str(e))

        return render(request=request, template_name="course/exam_check.html",
                    context = { "stud_info": stu_prof,
                                "user_id": request.user.id,
                                "exam_id": exam_id,
                                "exam_form": exam_form, 
                                "exam_answer_form": exam_answer_form,
                                "qTypeList": exam_sys.q_type_list })
    elif request.is_ajax() and request.method == "POST":
        examAns = ExamAnswer.objects.using(request.db_name).get(id=examans_id)        
        print(request.POST['addition_score'])
        examAns.addition_score = request.POST['addition_score']
        examAns.save()
        return HttpResponse("Suc")


@course_required()
def exam_ready(request):
    stu_prof = StudentProf.objects.get(user=request.user)
    exam = exam_sys.checkNearestExam(request.db_name, stu_prof.class_id.id)
    if exam:
        return JsonResponse(exam, safe=False)

    return HttpResponse('No Exam')


def handle_audio_file(f, fileName):
    with open(fileName, 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


@course_required()
def exam_voice_answer(request, student_id, exam_id):
    if request.method == "POST" and request.is_ajax():
        qtype = request.POST["type"]
        qindex = request.POST["index"]
        fileName = request.db_name + '\\student\\' + str(student_id) + '\\exam\\' + str(exam_id) + '\\' 
        abs_fileName = os.path.join(settings.MEDIA_ROOT, fileName)
        if not os.path.exists(abs_fileName):
            os.makedirs(abs_fileName)

        fileName = fileName + str(qtype) + '_' + str(qindex) + '.wav'   
        abs_fileName = os.path.join(settings.MEDIA_ROOT, fileName)             
        file = request.FILES['voice']
        handle_audio_file(file, abs_fileName)
        
        return JsonResponse({"type": qtype, "index": qindex, "fileName": settings.MEDIA_URL + fileName})


# --------------------------------------------------------
# tool func
@course_required()
def get_lesson_list_html(request):
    lesson_list = Lesson.objects.using(request.db_name).all().values('id', 'description')
    return loader.render_to_string(template_name="course/course_list.html", context={"lesson_list": lesson_list})


# --------------------------------------------------------
# class setting
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def class_setting(request):
    if request.method == 'GET':
        class_list = ClassInfo.objects.all()
        lesson_list = Lesson.objects.using(request.db_name).all().values('id', 'description')
        course_html = get_lesson_list_html(request)

        return render(request=request, template_name="course/class_setting.html",
                    context = { "lesson_list": lesson_list,
                                "qTypeList": exam_sys.q_type_list,
                                'class_list': class_list,
                                'course_html': course_html,
                                'course_desc': request.course_desc, })


@course_required()
def class_prac(request, class_id):
    if not request.is_ajax():
        return HttpResponse("Fail")
    
    try:
        clsInfo = ClassInfo.objects.get(id=class_id)            
    except ObjectDoesNotExist as e:
        print(e)
        return HttpResponse('No class info')

    try:
        cls_set = ClassSetting.objects.using(request.db_name).get(class_id=class_id)
    except ObjectDoesNotExist as e:
        print(e)
        cls_set = ClassSetting(class_id=class_id)
    
    if request.method == "POST":
        cls_set.practise_setting = request.POST.get('ps')
        cls_set.prac_lock_mode = request.POST.get('lock')
        cls_set.unlock_number = request.POST.get('unlock_number')
        cls_set.exam_ticket = request.POST.get('exam_ticket')
        cls_set.quests_filter = request.POST.get('qf')
        cls_set.lesson_order = request.POST.get('order')
        cls_set.save(using=request.db_name)
        
    data = "error"
    if cls_set.practise_setting:
        data = {"ps": json.loads(s=cls_set.practise_setting), 
                "unlock_number": cls_set.unlock_number,
                "exam_ticket": cls_set.exam_ticket,
                "qf": json.loads(s=cls_set.quests_filter),
                "order": json.loads(s=cls_set.lesson_order) if cls_set.lesson_order else "",
                "lock": cls_set.prac_lock_mode }

    return JsonResponse(data, safe=False)
            
