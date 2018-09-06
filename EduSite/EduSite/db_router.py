
DATABASE_COURSE_MAPPING = {
    "":"",
}


class CourseRouter:
    """
    A router to control all database operations on models in the
    auth application.
    """
    def db_for_read(self, model, **hints):
        """
        Attempts to read auth models go to auth_db.
        """
        # if model._meta.app_label != 'course':
        #    return 'auth_db'
        if model._meta.app_label == 'CourseFunApp':
            return None
        else:
            return 'default'


    def db_for_write(self, model, **hints):
        """
        Attempts to write auth models go to auth_db.
        """
        if model._meta.app_label == 'CourseFunApp':
            return None
        else:
            return 'default'


    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the auth app is involved.
        """                
        return None


    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the course app only appears in the 'course_A' or 'course_B'
        database.
        """
        key_label = ''
        if 'model' in hints and hints['model'] is not None: 
            key_label = hints['model']._meta.app_label

        if db == 'course_A' or db == 'course_B':
            return key_label == 'CourseFunApp'
        elif key_label == 'CourseFunApp':
            return False           

        return None