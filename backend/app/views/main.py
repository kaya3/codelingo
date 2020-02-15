from app import app, db
from flask import jsonify
from flask_login import current_user, login_required

from app.decorators import force_password_change, language_choice_required
from app.models import *

import random
import itertools

@app.route('/choose_language/<int:language_id>', methods=['POST'])
@login_required
def choose_language(language_id):
	language = Language.query.get(language_id)
	if not language:
		return jsonify({ 'error': 'Language not found.' }), 404
	else:
		current_user.current_language = language
		db.session.add(current_user)
		db.session.commit()
		return jsonify({})


@app.route('/get_skills')
@language_choice_required
def get_skills():
	def skill_stats(skill):
		# TODO: compute stats
		level = 0
		progress = 0.5
		return {
			'name': skill.name,
			'level': level,
			'level_progress': progress,
		}
	
	skills = Skill.query.filter(Skill.language_id == current_user.current_language_id).order_by(Skill.order)
	return jsonify([
		[skill_stats(skill) for skill in v]
		for _, v in itertools.groupby(skills, key=lambda s: s.order)
	])

@app.route('/get_next_lesson/<int:skill_id>')
@language_choice_required
def get_lesson(skill_id):
	skill = Skill.query.get(skill_id)
	if not skill:
		return 'Skill not found.', 404
	else:
		lesson = random.choice(list(skill.lessons))
		return jsonify({
			'name': skill.name,
			'language': skill.language.name,
			'questions': [q.data for q in lesson.questions]
		})
