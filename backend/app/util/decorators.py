__all__ = ['force_password_change', 'language_choice_required', 'run_in_thread', 'url_converter']

from functools import wraps
from threading import Thread

from flask import jsonify
from flask_login import current_user
from werkzeug.routing import BaseConverter, ValidationError

def force_password_change(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if current_user.is_authenticated and current_user.require_change_password:
            return 'You are required to choose a new password.', 403
        return f(*args, **kwargs)
    return wrapper

def language_choice_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not current_user.is_authenticated or current_user.current_language:
            return 'You have not chosen a language to study.', 400
        return f(*args, **kwargs)
    return wrapper

def run_in_thread(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        thr = Thread(target=f, args=args, kwargs=kwargs)
        thr.start()
    return wrapper

def url_converter(app):
    def decorator(clazz):
        class InstanceConverter(BaseConverter):
            def to_python(self, url_string):
                instance = clazz.query.get(int(url_string))
                if instance:
                    return instance
                else:
                    raise ValidationError
            def from_python(self, instance):
                return instance.id
        app.url_map.converters[clazz.__name__] = InstanceConverter
        return clazz
    return decorator
