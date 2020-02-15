from functools import wraps
from threading import Thread

from flask import redirect, url_for
from flask_login import current_user, login_required

from app import app

def force_password_change(f):
	@wraps(f)
	def wrapper(*args, **kwargs):
		if current_user.is_authenticated and current_user.require_change_password:
			return redirect(url_for('change_password'))
		return f(*args, **kwargs)
	return wrapper

def language_choice_required(f):
	@wraps(f)
	def wrapper(*args, **kwargs):
		if current_user.is_authenticated and not current_user.current_language:
			return redirect(url_for('choose_language'))
		return f(*args, **kwargs)
	return login_required(wrapper)

def run_in_thread(f):
	def wrapper(*args, **kwargs):
		thr = Thread(target=f, args=args, kwargs=kwargs)
		thr.start()
	return wrapper
