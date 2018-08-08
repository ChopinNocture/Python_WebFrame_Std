from django.forms.models import model_to_dict
import CourseFunApp.models as QuestionModels

import random


q_type_list = QuestionModels.get_qType_list()

# get question

# generate a question set. Dict:{type:[]}
def generate_question_set(sectionID=[], per_sum=2, type_list=[]):
    tmp_list = type_list
    if not tmp_list:
        tmp_list = q_type_list

    q_json_list = []
    question_dict = {}
    for iter_tpName in tmp_list:
        print(' --- ' + iter_tpName)
        try:
            temp_class = QuestionModels.get_qType_class(iter_tpName)
        except (AttributeError) as e:
            raise e

        query_filter = temp_class.objects.filter(sectionID=sectionID, case_analyse=None)
        count = query_filter.count()
        need_num = min(per_sum, count)
        
        if need_num>0:
            if count == need_num:
                generated_list = list(query_filter)
            else:
                generated_list = random.sample(list(query_filter), need_num)

            print('' + str(len(generated_list)) + ':')
            if generated_list:
                for iter_item in generated_list:
                    question_dict = model_to_dict(iter_item)
                    question_dict['qType'] = iter_tpName
                    q_json_list.append(question_dict)

    return {'qType_list': q_type_list, 'qList': q_json_list}


def examination_default():
    exam = {"duration": 0}
    for i_type in q_type_list:
        exam[i_type] = {'score':1, 'qList':[]}

    return exam
