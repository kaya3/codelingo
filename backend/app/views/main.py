from app import app, db
from flask import jsonify
from flask_login import current_user, login_required

from app.decorators import language_choice_required
from app.models import User, Skill, SkillLevel, Language, Lesson, LessonCompleted

import random
import itertools

# TODO: don't do this later
language_choice_required = login_required = lambda f: f

def skill_stats(user, skill):
	skill_level = user.get_skill_level(skill)
	total_lessons = sum(1 for _ in skill.lessons.filter_by(level=skill_level.level + 1))
	if total_lessons == 0:
		total_lessons = sum(1 for _ in skill.lessons.filter_by(level=skill_level.level))
	return {
		'id': skill.id,
		'name': skill.name,
		'level': skill_level.level,
		'level_progress': skill_level.progress,
		'total_lessons': total_lessons,
	}

@app.route('/get_languages')
def get_languages():
	languages = {
		lang.name: lang.id
		for lang in Language.query.all()
	}
	return jsonify(languages)

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
	skills = Skill.query.filter(Skill.language_id == current_user.current_language_id).order_by(Skill.order)
	return jsonify(skills=[
		[skill_stats(current_user, skill) for skill in v]
		for _, v in itertools.groupby(skills, key=lambda s: s.order)
	])

@app.route('/get_next_lesson/<int:skill_id>')
@language_choice_required
def get_next_lesson(skill_id):
	current_user = User.query.get(1) # TODO
	skill = Skill.query.get(skill_id)
	if not skill:
		return 'Skill not found.', 404
	else:
		lessons = list(skill.lessons)
		completed_ids = {
			c.lesson_id
			for c in LessonCompleted.query.join(
				Lesson, LessonCompleted.lesson_id == Lesson.id
			).filter(
				LessonCompleted.user_id == current_user.id
			).filter(
				Lesson.skill_id == skill.id
			)
		}
		incomplete = [lesson for lesson in lessons if lesson.id not in completed_ids]
		lesson = min(incomplete, key=lambda l: l.level) if incomplete else random.choice(lessons)
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
		skill = lesson.skill
		skill_level = current_user.get_skill_level(skill)
		
		if skill_level.level < lesson.level:
			ids_completed = set(l.id for l in current_user.lessons_completed if l.lesson.skill_id == skill.id and l.lesson.level == lesson.level)
			print(ids_completed)
			if lesson.id not in ids_completed:
				lessons_in_skill = skill.lessons.filter(Lesson.level == lesson.level).count()
				skill_level.progress = (len(ids_completed) + 1) / lessons_in_skill
				if lessons_in_skill == len(ids_completed) + 1:
					skill_level.level = lesson.level
					if skill.lessons.filter(Lesson.level > lesson.level).count() > 0:
						skill_level.progress = 0
				
				db.session.add(skill_level)
		
		completion = current_user.lessons_completed.filter_by(lesson_id=lesson.id).one_or_none() or LessonCompleted(current_user, lesson)
		completion.number_of_times += 1
		
		db.session.add(completion)
		db.session.commit()
		
		return jsonify(skill_stats(current_user, lesson.skill))
