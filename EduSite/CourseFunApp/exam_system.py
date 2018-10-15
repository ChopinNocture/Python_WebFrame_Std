from datetime import timedelta
from django.utils import timezone
from django.forms.models import model_to_dict
import CourseFunApp.models as QuestionModels 

import random


q_type_list = QuestionModels.get_qType_list()


# get question

# generate a question set. Dict:{type:[]}
def generate_question_set(db_name, sectionID=[], per_sum=2, type_list=[], num_json=None):
    tmp_list = type_list
    if not tmp_list:
        tmp_list = q_type_list

    q_json_list = []
    question_dict = {}
    for iter_tpName in tmp_list:
        print(' --- ', iter_tpName, num_json)
        try:
            temp_class = QuestionModels.get_qType_class(iter_tpName)
        except (AttributeError) as e:
            raise e

        query_filter = temp_class.objects.using(db_name).filter(sectionID=sectionID, case_analyse=None)
        count = query_filter.count()
        
        if num_json and num_json[iter_tpName] is not None:
            need_num = min(num_json[iter_tpName], count)
        else:
            need_num = min(per_sum, count)
        
        if need_num>0:
            if count == need_num:
                generated_list = list(query_filter)
            else:
                generated_list = random.sample(list(query_filter), need_num)

            if generated_list:
                for iter_item in generated_list:
                    if hasattr(iter_item, 'qVoice'):
                        question_dict = model_to_dict(iter_item, exclude=['qVoice', 'key'])
                        question_dict['qVoice'] = str(iter_item.qVoice)
                        question_dict['key'] = str(iter_item.key)
                    else:
                        question_dict = model_to_dict(iter_item)

                    question_dict['qType'] = iter_tpName
                    q_json_list.append(question_dict)

    return {'qType_list': q_type_list, 'qList': q_json_list}


def get_questions_by_id_list(qtype, id_list, db_name):
    try:
        temp_class = QuestionModels.get_qType_class(qtype)
    except (AttributeError) as e:
        raise e
    
    ques_list = list()
    for id_iter in id_list:
        question = temp_class.objects.using(db_name).get(id=id_iter)
        ques_list.append(model_to_dict(question))

    return {'qtype':qtype, 'questions':ques_list}


def examination_default():
    exam = {"duration": 0}
    for i_type in q_type_list:
        exam[i_type] = {'score':1, 'qList':[]}

    return exam


def checkNearestExam(db_name, class_id):
    try:
        td = timedelta(hours=3)
        exams = QuestionModels.Examination.objects.using(db_name).filter(start_time__range=(timezone.now()-td, timezone.now()+td)).values('id', 'title', 'duration', 'start_time', 'class_id_list')
        
        for iter_exam in exams:
            if iter_exam['class_id_list'].find(str(class_id)) is not -1:
                td = timedelta(iter_exam["duration"])
                if iter_exam['start_time'] + td >= timezone.now():
                    return iter_exam
        return None
    except Exception as e:
        print("no exam", e)
        return None

    return None
