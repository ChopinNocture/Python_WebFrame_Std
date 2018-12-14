from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User

from CourseFunApp.models import Lesson, Examination, ClassSetting, ExamAnswer
from AccountApp.models import ClassInfo, StudentProf

from .models import StudentInfo, TeacherInfo, ClassOrinInfo

# Create your views here.
def sync_all(request):
    print("start sync cas info......")

    classes = ClassOrinInfo.objects.all()
    for iter in classes:
        if iter.classinfo_id == -1:
            newClass = ClassInfo(class_name=iter.name)
            newClass.save()
            iter.classinfo_id = newClass.id
            iter.save()

    teachers = TeacherInfo.objects.all()
    for iter in teachers:
        if iter.user_id == -1:
            newUser = User.objects.create_user(iter.student_id, '', '')
            newUser.name = iter.name
        try:
            stup = StudentProf.objects.get(user=user)
        except ObjectDoesNotExist as e:            
            stup = StudentProf(user=user, class_id=classinfo, student_number=9999991)
        finally:            
            stup.class_id = classinfo
            stup.student_number=9999991
            stup.save()
            print(stup, "added!")

    students = StudentInfo.objects.all()
    for iter in teachers:
        if iter.user_id == -1:
            pass

    # create teacher    
    try:
        user = User.objects.get(username='teacher001')
    except ObjectDoesNotExist as e:
        user = User.objects.create_user('teacher001', '', 'test1234')            
    finally:            
        group = Group.objects.get(name=TEACHER_GROUP_NAME)
        user.groups.add(group)
        user.save()
        print(user, "added!")

    # create test class
    try:
        classinfo = ClassInfo.objects.get(class_name='测试班级')
    except ObjectDoesNotExist as identifier:
        classinfo = ClassInfo(class_name='测试班级')
        classinfo.save()

    print("Sync finished......")
    return HttpResponse("Sync finished!", status=200)