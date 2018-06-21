from django.forms.models import model_to_dict
import CourseFunApp.models as QuestionModels

import random

q_type_list = QuestionModels.get_qType_list()
# get question

# generate a question set. Dict:{type:[]}
def generate_question_set(sectionID=[], per_sum=4, type_list=[]):
    tmp_list = type_list    
    if len(tmp_list) == 0:
        tmp_list = q_type_list

    q_json_list = []
    question_dict = {}
    for iter_tpName in tmp_list:
        print(' --- ' + iter_tpName)
        try:
            temp_class = QuestionModels.get_qType_class(iter_tpName)
        except (AttributeError) as e:
            raise e

        count = temp_class.objects.filter(sectionID=sectionID).count()
        need_num = min(per_sum, count)
        if count==need_num:
            generated_list = temp_class.objects.filter(sectionID=sectionID)
        else:
            rand_ids = random.sample(range(1, count), need_num)
            generated_list = temp_class.objects.filter(sectionID=sectionID, id__in=rand_ids)
        
        print('' + str(len(generated_list)) + ':')
        if len(generated_list)>0:            
            for iter_item in generated_list:
                question_dict = model_to_dict(iter_item)
                question_dict['qType'] = iter_tpName
                q_json_list.append(question_dict)
    
    return {'qType_list':q_type_list, 'qList':q_json_list}
    