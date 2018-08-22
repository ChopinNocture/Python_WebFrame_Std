from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth import authenticate, login, get_user
from django.contrib.auth.models import User, AnonymousUser
from django.contrib.auth.decorators import login_required, permission_required
# Create your views here.
from AccountApp.forms import LoginForm, Student_Prof_Form
from AccountApp.models import ClassInfo, TeacherProf, StudentProf
from CourseFunApp.models import Lesson, UNLOCK_NUMBER


def user_login(request):
    print(request.POST.get('next'))
    if request.method == 'POST':
        login_form = LoginForm(request.POST)
        if login_form.is_valid():
            data = login_form.cleaned_data
            user = authenticate(username=data['username'], password=data['password'])

            if user:
                login(request, user)
                if user.groups.filter(name='teachers').exists():
                    return HttpResponseRedirect('/user/teacher/')
                else:
                    return HttpResponseRedirect('/user/student/')
                # return HttpResponse('Welcome!')
            else:
                return HttpResponse('Sorry!')
        else:
            return HttpResponse('Invalid login')

    if request.method == 'GET':
        login_form = LoginForm()
        return render(request, 'user/login.html', {'form': login_form})


@login_required(login_url='/user/login/')
def student_main(request):
    lesson_list = Lesson.objects.all().values('id', 'description')

    cur_user = request.user
    if cur_user is not None:
        cur_prof = StudentProf.objects.get(user=cur_user)
    # stu_form = Student_Prof_Form(instance=cur_prof) 

    return render(request, 'user/student_main.html', 
                    {'stud_info':cur_prof, 
                    "lesson_list": lesson_list,
                    "unlock_number": UNLOCK_NUMBER})


# @login_required(login_url='/user/login/')
def teacher_main(request):
    return render(request, 'user/teacher_main.html')


@login_required(login_url='/user/login/')
def student_manager(request):
    if request.method == 'GET':
        class_list = ClassInfo.objects.all()

        return render(request, 'user/student_manager.html', {'class_list': class_list})


@login_required(login_url='/user/login/')
def student_list(request, class_id=None):
    if not request.is_ajax():
        return HttpResponse("Permission reject!")

    if request.method == 'GET':
        if class_id is None:
            stu_list = StudentProf.objects.all().values('user', 'user__username')
        else:
            stu_list = StudentProf.objects.filter(class_id=class_id).values('user', 'user__username')

        return render(request, 'user/student_list.html', {'student_list': stu_list})


@login_required(login_url='/user/login/')
def get_student_prof(request, student_id):
    if not request.is_ajax():
        return HttpResponse("Permission reject!")

    if request.method == 'GET':
        user = User.objects.get(id=student_id)
        stu_prof = StudentProf.objects.get(user=user)
        stu_form = Student_Prof_Form(instance=stu_prof)
    
        return render(request, 'user/student_prof.html', {'form_student': stu_form})


# 
def award_score(request):    
    if request.method == "POST":        
        cur_user = get_user(request)
        if isinstance(cur_user, AnonymousUser):
            return HttpResponse("failed!")
        try:
            cur_prof = StudentProf.objects.get(user=cur_user)
            gold_award = int(request.POST.get('gold'))
            print(gold_award)
            cur_prof.gold = cur_prof.gold + gold_award
            cur_prof.save()

        except Exception as e:
            print(e)

        # return HttpResponseRedirect('/user/student/')
        return HttpResponse("Succeed!", status=200)
    else:
        return HttpResponse("failed!")


def update_progress(request):
    if request.method == "POST":    
        cur_user = get_user(request)
        if isinstance(cur_user, AnonymousUser):
            return HttpResponse("failed!")

        try:
            progress = int(request.POST.get('progress'))
            cur_prof = StudentProf.objects.get(user=cur_user)
            cur_prof.progress = progress
            cur_prof.save()            

        except Exception as e:
            print(e)

        # return HttpResponseRedirect('/user/student/')
        return HttpResponse("Succeed!", status=200)
    else:
        return HttpResponse("failed!")            