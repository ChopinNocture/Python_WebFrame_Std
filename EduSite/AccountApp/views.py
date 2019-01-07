from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect, JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth import authenticate, login, logout, get_user
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.auth.decorators import login_required, permission_required
from django.conf import settings

# Create your views here.
from AccountApp import COURSE_KEY
from AccountApp.forms import LoginForm
from AccountApp.models import ClassInfo, TeacherProf, StudentProf, StudentProgressInfo, Course, TEACHER_GROUP_NAME, STUDENT_GROUP_NAME
from AccountApp.decorators import course_required
from CourseFunApp.models import Lesson, ClassSetting, ExamAnswer, Examination

def user_logout(request):
    if request.user:
        logout(request)
    return HttpResponseRedirect(settings.REDIRECT_LOGIN_URL)


def user_login(request):
    print(request.POST.get('next'))
    if request.method == 'POST':
        login_form = LoginForm(request.POST)
        if login_form.is_valid():
            data = login_form.cleaned_data
            user = authenticate(username=data['username'], password=data['password'])

            if user:
                login(request, user)
                return HttpResponseRedirect('/user/course/')

                # return HttpResponse('Welcome!')
            else:
                return HttpResponse('Sorry!')
        else:
            return HttpResponse('Invalid login')

    if request.method == 'GET':
        if settings.LOGIN_URL == 'user/login/':
            login_form = LoginForm()
            return render(request, 'user/login.html', {'form': login_form})
        else:
            return HttpResponseRedirect(settings.REDIRECT_LOGIN_URL)


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def student_main(request):
    lesson_list = Lesson.objects.using(request.db_name).all().values('id', 'description')

    cur_user = request.user    
    cur_info = StudentProf.objects.get(user=cur_user)
    try:
        cur_prof = StudentProgressInfo.objects.using(request.db_name).get(user_id=cur_user.id)
        add_gold = cur_prof.add_gold
        cur_prof.add_gold = 0
        cur_prof.save()
    except ObjectDoesNotExist as e:
        print('!!', e)
        add_gold = 0
        cur_prof = StudentProgressInfo(user_id=cur_user.id)
        cur_prof.save(using=request.db_name)
    
    try:
        cls_set = ClassSetting.objects.using(request.db_name).get(class_id=cur_info.class_id.id)
    except ObjectDoesNotExist as e:    
        print('class setting missing!!', e)
        cls_set = ClassSetting(class_id=cur_info.class_id.id)

    try:
        exam_ans_list = ExamAnswer.objects.using(request.db_name).filter(user_id=cur_user.id).values("exam", "id")
        for exam_ans in exam_ans_list:
            exam = Examination.objects.using(request.db_name).get(id=exam_ans['exam'])
            exam_ans['title'] = exam.title
    except ObjectDoesNotExist as e:
        print(e)
        exam_ans_list = []

    return render(request, 'user/student_main.html', 
                    {'stud_info': cur_info, 
                    'exam_ans_list': exam_ans_list,
                    'stud_cprof': cur_prof,
                    'add_gold': add_gold,
                    'cls_set': cls_set,
                    "lesson_list": lesson_list,
                    "unlock_number": cls_set.unlock_number})


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def teacher_main(request):
    return render(request, 'user/teacher_main.html', {'course_desc':request.course_desc})


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def student_manager(request):
    if request.method == 'GET':
        class_list = ClassInfo.objects.all()

        return render(request, 'user/student_manager.html', {'class_list': class_list})


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
def student_list(request, class_id=None):
    if not request.is_ajax():
        return HttpResponse("Permission reject!")

    if request.method == 'GET':
        if class_id is None:
            stu_list = StudentProf.objects.all().values('user', 'user__username')
        else:
            stu_list = StudentProf.objects.filter(class_id=class_id).values('user', 'user__username')

        return render(request, 'user/student_list.html', {'student_list': stu_list})


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def get_student_prof(request, student_id):
    if not request.is_ajax():
        return HttpResponse("Permission reject!")

    if request.method == 'GET':
        try:
            user = User.objects.get(id=student_id)
            stud_prof = StudentProf.objects.get(user=user)
            stud_prog = StudentProgressInfo.objects.using(request.db_name).get(user_id=user.id)    
            exam_ans_list = ExamAnswer.objects.using(request.db_name).filter(user_id=student_id).values("exam", "id", "score", "addition_score")
            for exam_ans in exam_ans_list:
                exam = Examination.objects.using(request.db_name).get(id=exam_ans['exam'])
                exam_ans['title'] = exam.title
        except ObjectDoesNotExist as e:
            print(str(e))
            return HttpResponseNotAllowed("信息缺失："+str(e))
            
        return render(request, 'user/student_prof.html', 
                            {'stud_prog': stud_prog, 'stud_prof': stud_prof, 'exam_ans_list': exam_ans_list})


# 
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def award_score(request):    
    if request.method == "POST":
        user_id = request.POST.get('user_id')
        if user_id==None:
            cur_user = get_user(request)
            if not isinstance(cur_user, AnonymousUser):
                user_id = cur_user.id

        try:
            cur_prof = StudentProgressInfo.objects.using(request.db_name).get(user_id=user_id)
            gold_award = int(request.POST.get('gold'))
            cur_prof.gold = cur_prof.gold + gold_award
            cur_prof.add_gold = cur_prof.add_gold + gold_award
            cur_prof.save()

        except Exception as e:
            print(e)

        # return HttpResponseRedirect('/user/student/')
        return JsonResponse({})
    else:
        return HttpResponse("failed!")


@course_required()
def update_progress(request):
    if request.method == "POST":    
        cur_user = get_user(request)
        if isinstance(cur_user, AnonymousUser):
            return HttpResponse("failed!")

        try:
            progress = int(request.POST.get('progress'))
            cur_prof = StudentProgressInfo.objects.using(request.db_name).get(user_id=cur_user.id)
            cur_prof.progress = progress
            cur_prof.save(using=request.db_name)

        except Exception as e:
            print(e)

        # return HttpResponseRedirect('/user/student/')
        return JsonResponse({})
    else:
        return HttpResponse("failed!")            


# --------------------------------------------------------
# course
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
def course_select(request):
    if request.method == "GET":
        if request.user.groups.filter(name__in=[TEACHER_GROUP_NAME, STUDENT_GROUP_NAME]).exists():
            course_list = Course.objects.all()
            return render(request=request, template_name="user/course_selector.html",
                    context={"course_list": course_list})
        else:
            return HttpResponse('用户'+str(request.user.username) + '非学生也非老师，请联系管理员！！')
    else:
        course_id = request.POST['course_id']
        
        try:
            course = Course.objects.get(id=course_id)
            request.session.cycle_key()
            request.session[COURSE_KEY] = course_id
            request.db_name = course.db_name

            if request.user.groups.filter(name=TEACHER_GROUP_NAME).exists():
                return HttpResponseRedirect('/user/teacher/')
            elif request.user.groups.filter(name=STUDENT_GROUP_NAME).exists():
                return HttpResponseRedirect('/user/student/')
            else:
                return HttpResponse('用户'+str(request.user.username) + '非学生也非老师，请联系管理员！！')
                
                        
        except ObjectDoesNotExist as e:
            print(e)
            return None

