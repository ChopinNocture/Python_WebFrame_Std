from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from datetime import timedelta
from django.conf import settings

# Create your views here.
# from .models import Notices
# from .forms import NoticesForm
#from django.utils.dateformat import DateFormat
from AccountApp.decorators import course_required
from AccountApp.models import StudentProf, TeacherProf, ClassInfo, Course
from CourseFunApp.models import Lesson, ClassSetting, ExamAnswer, Examination, LessonContent
from CourseFunApp.models import Question, FillInBlankQuestion, TrueOrFalseQuestion, ChoiceQuestion, MultiChoiceQuestion, PairQuestion, SortQuestion, CaseAnalyseQuestion, VoiceQuestion, ContractQuestion
# import CourseFunApp.models as QuestionModels
from NoticeApp.models import Notices

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
        #Lesson.objects.using(dbname)
        quest_stat = []
        quest_sum = 0
        for qType in Question.__subclasses__():
            qs = qType.objects.using(dbname).count()
            quest_stat.append({"type": qType.get_url_name(), "sum": qs})
            quest_sum += qs
            
        course_stat = {"quest_stat": quest_stat, "quest_sum": quest_sum }

        return render(request=request,
                      template_name='statistic/statistic_main.html',
                      context={'overview': overview, 'course_stat': course_stat})
