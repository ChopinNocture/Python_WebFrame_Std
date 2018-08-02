import CourseFunApp.models as questionModels
import CourseFunApp.exam_system as exam_sys
import xlwings

def update_DB_from_excel(excel_url):
    wb = xlwings.Book(excel_url)

    config_sht = wb.sheets['config']
    sht_name_list = config_sht.range('D2:D8').value

    for sht_name in sht_name_list:
        cur_sht = wb.sheets[sht_name]
        if cur_sht is not None: 
            row_idx = 3

            while True:
                idx_str = str(row_idx)
                ques_desc = cur_sht.range('G' + idx_str).value
                ques_type = cur_sht.range('F' + idx_str).value

                if ques_desc is not None and len(ques_desc)>0:
                    print(ques_type)
                    try:
                        temp_class = questionModels.get_qType_class(ques_type)
                    except (AttributeError) as e:
                        raise e
                else:
                    break

                row_idx += 1
        