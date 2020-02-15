from app import app, db
from flask import render_template, request, flash, redirect
from flask_login import current_user, login_required

from app.decorators import force_password_change
from app.models import *

@app.route('/')
def index():
	if current_user.is_authenticated:
		return render_template('index_logged_in.html')
	else:
		return render_template('index_logged_out.html')

@app.route('/user/<username>/')
def user_info(username):
	user = User.query.filter(User.username == username).one()
	if not user:
		return 'User not found.', 404
	return render_template('user_info.html', user=user)
