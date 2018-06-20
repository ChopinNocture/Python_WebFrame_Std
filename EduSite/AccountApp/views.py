from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required, permission_required
# Create your views here.
from AccountApp.forms import LoginForm, Student_Prof_Form
from AccountApp.models import ClassInfo, TeacherProf, StudentProf

def user_login(request):
    if request.method == 'POST':
        login_form = LoginForm(request.POST)
        if login_form.is_valid():
            data = login_form.cleaned_data
            user = authenticate(username=data['username'], password=data['password'])

            if user:
                login(request, user)
                if user.groups.filter(name='Teacher').exists():
                    return HttpResponseRedirect('/course/questions/editor/')
                else:
                    return HttpResponseRedirect('/course/answer_sheet/1/')
                #return HttpResponse('Welcome!')
            else:
                return HttpResponse('Sorry!')
        else:
            return HttpResponse('Invalid login')
    
    if request.method == 'GET':
        login_form = LoginForm()
        return render(request, 'user/login.html', {'form': login_form})


@login_required(login_url='/user/login/')
def student_manager(request):
    if request.method == 'GET':
        class_list = ClassInfo.objects.all()

        return render(request, 'user/student_manager.html', {'class_list': class_list})


@login_required(login_url='/user/login/')
def get_student_prof(request, student_id):
    user = User.objects.get(id=student_id)
    stu_prof = StudentProf.objects.get(user=user)
    stu_form = Student_Prof_Form(instance=stu_prof) 
    return render(request, 'user/student_prof.html', {'form_student':stu_form})
