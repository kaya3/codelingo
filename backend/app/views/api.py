from app import app, db
from flask import render_template, request, flash, redirect, jsonify
from flask_login import current_user, login_required

from app.decorators import force_password_change
from app.models import *

import random
from itertools import groupby

# TODO: require login
login_required = lambda f: f

@app.route('/api/get_skills')
@login_required
def get_skills():
	skills = Skill.query.filter(Skill.language_id == current_user.current_language_id).order_by(Skill.order)
	return jsonify([
		# TODO: compute statistics
		[{ 'name': skill.name, 'level': 1, 'level_progress': 0.5 } for skill in v]
		for _, v in groupby(skills, key=lambda s: s.order)
	])

@app.route('/api/get_next_lesson/<int:skill_id>')
@login_required
def get_lesson(skill_id):
	skill = Skill.query.get(skill_id)
	if not skill:
		return 'No such skill.', 404
	
	lesson = random.choice(list(skill.lessons))
	return jsonify({
		'name': skill.name,
		'language': skill.language.name,
		'questions': [q.data for q in lesson.questions]
	})

@app.route('/api/choose_language/<int:language_id>', methods=['POST'])
@login_required
def choose_language(language_id):
	language = Language.query.get(language_id)
	if language:
		current_user.current_language = language
		db.session.add(current_user)
		db.session.commit()
		return jsonify({})
	else:
		return 'Language not found.', 404
