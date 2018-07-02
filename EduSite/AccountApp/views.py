from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, permission_required
# Create your views here.
from AccountApp.forms import LoginForm, Student_Prof_Form
from AccountApp.models import ClassInfo, TeacherProf, StudentProf

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
                #return HttpResponse('Welcome!')
            else:
                return HttpResponse('Sorry!')
        else:
            return HttpResponse('Invalid login')
    
    if request.method == 'GET':
        login_form = LoginForm()
        return render(request, 'user/login.html', {'form': login_form})

from CourseFunApp.views import Lesson

@login_required(login_url='/user/login/')
def student_main(request):    
    course_list = list()
    lesson_list = Lesson.objects.all()

    for iter in lesson_list:
        course_list.append({"id":iter.id, "name":iter.description})

    cur_user = request.user  
    if cur_user is not None:
        cur_prof = StudentProf.objects.get(user=cur_user)
    stu_form = Student_Prof_Form(instance=cur_prof)
    return render(request, 'user/student_main.html',{'form_student':stu_form, "course_list":course_list})

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
    print("---------" + str(class_id))
    if request.method == 'GET':
        if class_id is None:
            stu_list = StudentProf.objects.all().values('user', 'user__username')
        else:
            stu_list = StudentProf.objects.filter(class_id=class_id).values('user', 'user__username')
            
        print(stu_list)
        return render(request, 'user/student_list.html', {'student_list': stu_list})


@login_required(login_url='/user/login/')
def get_student_prof(request, student_id):
    user = User.objects.get(id=student_id)
    stu_prof = StudentProf.objects.get(user=user)
    stu_form = Student_Prof_Form(instance=stu_prof) 
    return render(request, 'user/student_prof.html', {'form_student':stu_form})
