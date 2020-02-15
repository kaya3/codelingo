from app import app, db
from flask import render_template, request, flash, redirect, jsonify
from flask_login import current_user, login_required

from app.decorators import force_password_change
from app.models import *

import random

@app.route('/api/get_next_lesson/<int:skill_id>')
# TODO: require login
#@login_required
def get_lesson(skill_id):
	skill = Skill.query.get(skill_id)
	if not skill:
		return 'No such skill.', 404
	
	lesson = random.choice(list(skill.lessons))
	return jsonify({
		'name': skill.name,
		'language': skill.language_name,
		'questions': [q.data for q in lesson.questions]
	})
