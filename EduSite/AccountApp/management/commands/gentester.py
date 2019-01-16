from django.core.management.base import BaseCommand, CommandError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User, Group
from AccountApp.models import StudentProf, ClassInfo, Course, TEACHER_GROUP_NAME, STUDENT_GROUP_NAME


class Command(BaseCommand):
    help = 'generate account of testers'

    def handle(self, *args, **options):
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
                
        # create student
        try:
            user = User.objects.get(username='student001')            
        except ObjectDoesNotExist as e:            
            user = User.objects.create_user('student001', '', 'test1234')
        try:
            stup = StudentProf.objects.get(user=user)
        except ObjectDoesNotExist as e:            
            stup = StudentProf(user=user, class_id=classinfo, student_number="9999991")            
        finally:            
            stup.class_id = classinfo
            stup.student_number='9999991'
            stup.save()
            print(stup, "added!")
        

        