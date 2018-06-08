import CourseFunApp.models as QuestionModels

q_type_list = QuestionModels.get_qType_list()
# get question

# generate a question set. Dict:{}
def generate_question_set(sectionID=[], per_sum=4, type_list=[]):
    tmp_list = type_list
    if tmp_list.count == 0:
        tmp_list = q_type_list

    for iter_tpName in tmp_list:
        try:
            temp_class = QuestionModels.get_qType_class(iter_tpName)
        except (AttributeError) as e:
            raise e
        # temp_class.objct

    print(len(tmp_list))
