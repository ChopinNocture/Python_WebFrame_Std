import openpyxl
import CourseFunApp.models as questionModels

# import CourseFunApp.exam_system as exam_sy


def update_DB_from_excel(excel_url):
    lesson_list = questionModels.Lesson.objects.all()

    wb = openpyxl.load_workbook(filename=excel_url, read_only=True, data_only=True)
    # sectionID
    # description
    config_sht = wb['config']

    for row in range(2, 8):
        qTypeName = config_sht.cell(row=row, column=4).value

        print("----" + str(qTypeName))
        cur_sht = wb[qTypeName]
        if cur_sht is not None: 
            row_idx = 3

            while True:
                idx_str = str(row_idx)
                ques_desc = cur_sht['G' + idx_str].value
                ques_type = cur_sht['F' + idx_str].value

                if ques_desc is not None and len(ques_desc)>0:
                    print(ques_desc)
                    try:
                        print(ques_type)
                        temp_class = questionModels.get_qType_class(ques_type)
                    except (AttributeError) as e:
                        raise e

                    quests = temp_class.objects.filter(sectionID=section_id).values('id', 'description', 'sectionID', 'flag')
                else:
                    break

                row_idx += 1


# update_DB_from_excel('D:/Temp/DB_1.xlsm')