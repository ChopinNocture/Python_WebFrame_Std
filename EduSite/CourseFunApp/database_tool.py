import sys
import re
import openpyxl
import django.core.exceptions as excepts
import CourseFunApp.models as questionModels

# import CourseFunApp.exam_system as exam_sy

char_num_re = re.compile(r"[A-Z]")

def char_to_num(matchobj): 
    return str(ord(matchobj.group(0))-65)

    
def parse_FillInBlank(sheet, row, desc, lesson):
    key_num = int(sheet["I" + str(row)].value)

    key_list = []
    for idx in range(10, 10 + key_num):
        key_list.append(str(sheet.cell(column=idx, row=row).value))

    key_string = ','.join(key_list)
    print(desc + ' - ' + key_string)

    return questionModels.FillInBlankQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1,
        key = key_string
    )


def parse_TrueOrFalse(sheet, row, desc, lesson):
    key = (sheet["I" + str(row)].value == '正确')    
    print(desc + ' - ' + str(int(key)))
    return questionModels.TrueOrFalseQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1,
        key = int(key)
    )


def parse_Choice(sheet, row, desc, lesson):
    key = sheet['I' + str(row)].value
    key = char_num_re.sub(char_to_num, key)
# >>> ord('b')  # convert char to int
# 98
# >>> chr(100)  # convert int to char
# 'd'

    idx = 10
    option_list = []
    option = sheet.cell(column=idx, row=row).value

    while option is not None:
        option_list.append(option)
        idx += 1
        option = sheet.cell(column=idx, row=row).value        
    
    option = "|-|".join(option_list)

    print(desc + ' - ' + key + ' - ' + option)
    return questionModels.ChoiceQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1,
        options = option,
        key = key
    )    


def parse_MultiChoice(sheet, row, desc, lesson):
    char_list = list(sheet['I' + str(row)].value.upper())
    char_list.sort()
    key = ','.join(char_list)
    key = char_num_re.sub(char_to_num, key)

    idx = 10
    option_list = []
    option = sheet.cell(column=idx, row=row).value

    while option is not None:
        option_list.append(option)
        idx += 1
        option = sheet.cell(column=idx, row=row).value
    
    option = "|-|".join(option_list)

    print(desc + ' - ' + key + ' - ' + option)
    return questionModels.MultiChoiceQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1,
        options = option,
        key = key
    )
    


def parse_Pair(sheet, row, desc, lesson):
    idx = 0
    option_l_list = []
    option_r_list = []
    option_l = sheet.cell(column=10+idx<<1, row=row).value
    option_r = sheet.cell(column=11+idx<<1, row=row).value

    while option_l is not None:
        option_l_list.append(option_l)
        option_r_list.append(option_r)
        idx += 1
        option_l = sheet.cell(column=10+idx<<1, row=row).value
        option_r = sheet.cell(column=11+idx<<1, row=row).value
    
    option_l = "|-|".join(option_l_list)
    option_r = "|-|".join(option_r_list)

    return questionModels.PairQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1, 
        leftOptions = option_l,
        rightOptions = option_r 
    )


def parse_Sort(sheet, row, desc, lesson):
    idx = 10
    option_list = []
    option = sheet.cell(column=idx, row=row).value

    while option is not None:
        option_list.append(option)
        idx += 1
        option = sheet.cell(column=idx, row=row).value        
    
    option = "|-|".join(option_list)
    print(desc + ' - ' + option)

    return questionModels.SortQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1,
        options = option,
    )


def parse_Subject(sheet, row, desc, lesson):
    print(desc) 
    return questionModels.CaseAnalyseQuestion(  
        description = desc,
        sectionID = lesson,
        flag = 3,
        star = 1,
    )       


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
                    try:
                        print(ques_type)
                        lesson_desc = cur_sht['A' + idx_str].value                        
                        lesson = lesson_list.get(description=lesson_desc)
                        
                        parsefunc = getattr(sys.modules[__name__], "parse_" + ques_type)
                        quest = parsefunc(cur_sht, row_idx, ques_desc, lesson)
                        print(quest)
                        # quest.save()

                    except (AttributeError) as e:
                        print("---- " + e)
                    except (excepts.ObjectDoesNotExist) as e:
                        print("??? " + str(e))

                else:
                    break

                row_idx += 1


# database_tool.
# update_DB_from_excel('D:/Temp/DB_1.xlsm')