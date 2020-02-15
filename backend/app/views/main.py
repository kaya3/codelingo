from app import app, db
from flask import render_template, request, flash, redirect, url_for
from flask_login import current_user, login_required

from app.decorators import force_password_change
from app.models import *

@app.route('/')
def index():
	if not current_user.is_authenticated:
		return render_template('index_logged_out.html')
	elif not current_user.current_language:
		langs = Language.query.all()
		return render_template('choose_language.html', all_languages=langs)
	else:
		skills = current_user.current_language.skills
		return render_template('index_logged_in.html', skills=skills)

@app.route('/choose_language/<int:language_id>', methods=['POST'])
@login_required
def choose_language(language_id):
	language = Language.query.get(language_id)
	if not language:
		return 'Language not found.', 404
	else:
		current_user.current_language = language
		db.session.add(current_user)
		db.session.commit()
		return redirect(url_for('index'))

@app.route('/study/<int:skill_id>')
@language_choice_required
def study(skill_id):
	skill = Skill.query.get(skill_id)
	if not skill:
		return 'Skill not found.', 404
	else:
		return render_template('lesson.html', skill=skill)

@app.route('/user/<username>')
def user_info(username):
	user = User.query.filter(User.username == username).one()
	if not user:
		return 'User not found.', 404
	else:
		return render_template('user_info.html', user=user)
