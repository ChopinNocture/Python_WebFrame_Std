from django.core.management.base import BaseCommand, CommandError
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import Group
from AccountApp.models import Course, TEACHER_GROUP_NAME


class Command(BaseCommand):
    help = 'check and generate basic DB:Courses and Groups'

    def handle(self, *args, **options):
        # create basic courses
        try:
            course = Course.objects.get(db_name='course_A')
        except ObjectDoesNotExist:
            course = Course(db_name='course_A')
        finally:
            course.description = "物业管理"
            course.save()
        
        print(course, "added!")
        try:
            course = Course.objects.get(db_name='course_B')
        except ObjectDoesNotExist:
            course = Course(db_name='course_B')
        finally:
            course.description = "房产销售"
            course.save()

        try:
            group = Group.objects.get(name=TEACHER_GROUP_NAME)
        except ObjectDoesNotExist:
            group = Group(name=TEACHER_GROUP_NAME)
        finally:
            group.
            group.save()            
        print(group, "added!")    
        

        