from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from datetime import timedelta, datetime
from django.conf import settings

# Create your views here.
# from .models import Notices
# from .forms import NoticesForm
#from django.utils.dateformat import DateFormat
# test
# from itertools import groupby
# from operator import attrgetter
from AccountApp.decorators import course_required
from AccountApp.models import StudentProf, TeacherProf, ClassInfo, Course
from CourseFunApp.models import ClassSetting, Examination, ExamAnswer, Lesson, LessonContent
from CourseFunApp.models import Question, FillInBlankQuestion, TrueOrFalseQuestion, ChoiceQuestion, MultiChoiceQuestion, PairQuestion, SortQuestion, CaseAnalyseQuestion, VoiceQuestion, ContractQuestion
from NoticeApp.models import Notices

# import CourseFunApp.models as QuestionModels

# Create your views here.
@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def get_statistic(request):
    if request.method == "GET":
        overview = {"sum": {"teacher": TeacherProf.objects.count(), 
                            "student": StudentProf.objects.count(),
                            "course": Course.objects.count(),
                            "class": ClassInfo.objects.count()}}
        
        dbname = request.db_name
        
        quest_stat = []
        quest_sum = 0
        for qType in Question.__subclasses__():
            qs = qType.objects.using(dbname).count()
            quest_stat.append({"type": qType.get_url_name(), "sum": qs})
            quest_sum += qs

        lesson_list = Lesson.objects.using(dbname).all().values('id', 'description')
        lesson_res = LessonContent.objects.using(dbname).order_by("lesson").values("lesson")

        course_stat = { "quest_stat": quest_stat, "quest_sum": quest_sum,
                        "lesson_list": lesson_list, "lesson_res": lesson_res,
                        }

        exam_list = get_exam_oneyear(request.db_name)

        return render(request=request,
                      template_name='statistic/statistic_main.html',
                      context={
                        'overview': overview, 
                        'course_stat': course_stat, 
                        'exam_list': exam_list, })


def get_exam_oneyear(db_name):
    current_date = timezone.now()
    past_year_start = timezone.datetime(current_date.year - 1, current_date.month, current_date.day+1)
    past_year_end = past_year_start + timedelta(days=365)
 
    exam_past_year = Examination.objects.using(db_name).filter(start_time__range=(past_year_start, past_year_end),end_time__lt=timezone.now()).values("id", "start_time", "title" )
    # test
    #exam_past_year = random_exam_data(past_year_start, past_year_end)

    sorted_data = sorted(exam_past_year, key=lambda x: x["start_time"], reverse=True)
    #print(sorted_data)
    return sorted_data


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def get_exam_answer_json(request):
    exam_id = request.POST['exam_id']
    query_exam_ans_list = ExamAnswer.objects.using(request.db_name).filter(
        exam=exam_id).values('exam', 'user_id', 'score', 'addition_score')
    # test
    #query_exam_ans_list = random_examanwser_data()

    #sorted_data = sorted(query_exam_ans_list, key=lambda x: x["score"], reverse=False)
    #grouped_data = {month: list(entries) for month, entries in groupby(sorted_data, key=lambda x: x["start_time"][:7])}
    return JsonResponse(query_exam_ans_list, safe=False)


def get_notice_oneyear(db_name):
    current_date = timezone.now()
    past_year_start = timezone.datetime(current_date.year - 1, current_date.month, current_date.day+1)
    past_year_end = past_year_start + timedelta(days=365)

    notices = random_notices(past_year_start, past_year_end)
    
    # test
    #print(notices)
    return notices


@login_required(login_url=settings.REDIRECT_LOGIN_URL)
@course_required()
def get_notices_json(request):
    notices = Notices.objects.using(request.db_name).all().values("id", "publicDate")
    # test
    #notices = get_notice_oneyear(request.db_name)
    return JsonResponse(notices, safe=False)


#=============================== Test Part ===============================
# Random test data
import random
def random_exam_data(start_date, end_date):
    list = []
    for i in range(100):
        time_delta = end_date - start_date
        random_days = random.randint(0, time_delta.days)
        random_date = start_date + timedelta(days=random_days)
        list.append({"id": random.randint(0,1000), "start_time": random_date, "title": "test" + str(random.randint(0, 10028)) })    
    return list 


def random_examanwser_data():
    list = []
    for i in range(100):
        list.append({"user_id": i, "score": random.randint(30, 100), "addition_score": random.randint(15, 20) })    
    return list


def random_notices(start_date, end_date):
    list = []
    for i in range(100):
        time_delta = end_date - start_date
        random_days = random.randint(0, time_delta.days)
        random_date = start_date + timedelta(days=random_days)
        list.append({"id": random.randint(0,1000), "publicDate": random_date })
    return list 