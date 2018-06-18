from django.shortcuts import render
from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
# Create your views here.
from AccountApp.forms import LoginForm

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
