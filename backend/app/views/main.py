from app import app, db
from flask import jsonify
from flask_login import current_user, login_required

from app.decorators import force_password_change, language_choice_required
from app.models import *

import random
import itertools

# TODO: don't do this later
language_choice_required = login_required = lambda f: f

@app.route('/choose_language/<int:language_id>', methods=['POST'])
@login_required
def choose_language(language_id):
	current_user = User.query.get(1) # TODO
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
	current_user = User.query.get(1) # TODO
	def skill_stats(skill):
		skill_level = current_user.get_skill_level(skill)
		return {
			'name': skill.name,
			'level': skill_level.level,
			'level_progress': skill_level.progress,
		}
	
	skills = Skill.query.filter(Skill.language_id == current_user.current_language_id).order_by(Skill.order)
	return jsonify([
		[skill_stats(skill) for skill in v]
		for _, v in itertools.groupby(skills, key=lambda s: s.order)
	])

@app.route('/get_next_lesson/<int:skill_id>')
@language_choice_required
def get_lesson(skill_id):
	current_user = User.query.get(1) # TODO
	skill = Skill.query.get(skill_id)
	if not skill:
		return 'Skill not found.', 404
	else:
		lesson = random.choice(list(skill.lessons))
		return jsonify({
			'name': skill.name,
			'language': skill.language.name,
			'lesson_id': lesson.id,
			'questions': [q.data for q in lesson.questions],
		})

@app.route('/complete_lesson/<int:lesson_id>', methods=['POST'])
@language_choice_required
def complete_lesson(lesson_id):
	current_user = User.query.get(1) # TODO
	lesson = Lesson.query.get(lesson_id)
	if not lesson:
		return 'Lesson not found.', 404
	else:
		skill_level = current_user.get_skill_level(lesson.skill)
		if skill_level.level < lesson.level:
			ids_completed = set(l.id for l in current_user.lessons_completed if l.skill == lesson.skill)
			if lesson.id not in lessons_completed:
				lessons_in_skill = lesson.skill.lessons.filter(Lesson.level == lesson.level).count()
				skill_level.progress = (ids_completed + 1) / lessons_in_skill
				if lessons_in_skill == len(ids_completed) + 1:
					skill_level.level = less.level
				
				completion = LessonCompleted(user, lesson)
				db.session.add(skill_level)
				db.session.add(completion)
				db.session.commit()
		
		return jsonify({})
		
		
