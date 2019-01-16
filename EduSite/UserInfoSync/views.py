import time
from django.shortcuts import render
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User, Group

from CourseFunApp.models import Lesson, Examination, ClassSetting, ExamAnswer
from AccountApp.models import ClassInfo, StudentProf, TeacherProf, TEACHER_GROUP_NAME, STUDENT_GROUP_NAME

from .models import StudentInfo, TeacherInfo, ClassOrinInfo


SYS_WORKING = False

# Create your views here.
def sync_all(request):
    t_start = time.clock()
    global SYS_WORKING

    statis_info = ""

    error_info = ''
    if SYS_WORKING:
        return HttpResponse("Last sync not finished, please wait.....", status=200)
    else:
        SYS_WORKING = True

    print("start sync cas info......")
    num = 0
    sum = 0
    classes = ClassOrinInfo.objects.all()
    for iter in classes:
        num += 1
        if iter.classinfo_id == -1:
            newClass = ClassInfo(class_name=iter.name)
            newClass.save()
            iter.classinfo_id = newClass.id
            iter.save()
        else:
            newClass = ClassInfo.objects.filter(id=iter.classinfo_id).update(class_name=iter.name)

    sum += num
    statis_info += " " + str(num) + " Class info records updated!<br>\n"

    num = 0
    # teachers update
    teachers = TeacherInfo.objects.all()
    for iter in teachers:
        num += 1
        try:
            user = User.objects.get(username=iter.user_name)
        except ObjectDoesNotExist:
            user = User.objects.create_user(username=iter.user_name)
        finally:
            if not user.groups.filter(name=TEACHER_GROUP_NAME).exists():    
                group = Group.objects.get(name=TEACHER_GROUP_NAME)
                user.groups.add(group)
                user.first_name = iter.name
                user.save()

        try:
            teacher_prof = TeacherProf.objects.get(user=user)
            teacher_prof.teacher_number = iter.teacher_id
        except ObjectDoesNotExist:
            teacher_prof = TeacherProf(user=user, teacher_number=iter.teacher_id)
        finally:
            teacher_prof.save()

    sum += num
    statis_info += " " + str(num) + " teachers updated!<br>\n"

    num = 0
    # students update
    students = StudentInfo.objects.all()
    for iter in students:
        num += 1
        try:
            user = User.objects.get(username=iter.user_name)
        except ObjectDoesNotExist:
            user = User.objects.create_user(username=iter.user_name)
        finally:
            if not user.groups.filter(name=STUDENT_GROUP_NAME).exists():
                group = Group.objects.get(name=STUDENT_GROUP_NAME)
                user.groups.add(group)
                user.first_name = iter.name
                user.save()
                print(group, '------', user)

        try:
            stup = StudentProf.objects.get(user=user)
            stup.student_number=iter.student_id
        except ObjectDoesNotExist as e:
            stup = StudentProf(user=user, student_number=iter.student_id)
        finally:
            try:
                stup.class_id = ClassInfo.objects.get(class_name=iter.class_name)
                stup.save()
            except ObjectDoesNotExist as e:
                error_info += '<br>' + str(e)
    
    sum += num      
    statis_info += " " + str(num) + " students updated!<br>\n"

    SYS_WORKING = False

    statis_info += "<br>\n Total " + str(sum) + " records updated. Used time:" + str(time.clock()-t_start) + " s"
    print("Sync finished......")
    return HttpResponse("Sync finished!<br>" + error_info + "<br><br>" + statis_info, status=200)


def test(request):    
    pass
