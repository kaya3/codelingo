import itertools
import random

from flask import jsonify
from flask_login import current_user, login_required

from app import app, db
from app.models import Language, Lesson, LessonCompleted, Skill, User
from app.util.decorators import language_choice_required

# TODO: don't do this later
language_choice_required = login_required = lambda f: f

def skill_stats(user, skill):
    skill_level = user.get_skill_level(skill)
    total_lessons = skill.lessons.filter_by(level=skill_level.level + 1).count()
    if total_lessons == 0:
        total_lessons = skill.lessons.filter_by(level=skill_level.level).count()
    max_level = max(l.level for l in skill.lessons)
    return {
        'id': skill.id,
        'name': skill.name,
        'level': skill_level.level,
        'max_level': max_level,
        'level_progress': skill_level.progress,
        'total_lessons': total_lessons,
    }

@app.route('/get_languages')
def get_languages():
    return jsonify({
        lang.name: lang.id
        for lang in Language.query.all()
    })

@app.route('/choose_language/<Language:language>', methods=['POST'])
@login_required
def choose_language(language):
    current_user = User.query.get(1) # TODO
    current_user.current_language = language
    db.session.commit()
    return jsonify({})

@app.route('/get_skills')
@language_choice_required
def get_skills():
    current_user = User.query.get(1) # TODO
    skills = current_user.current_language.skills.order_by(Skill.order)
    return jsonify(skills=[
        [skill_stats(current_user, skill) for skill in v]
        for _, v in itertools.groupby(skills, key=lambda s: s.order)
    ])

@app.route('/get_next_lesson/<Skill:skill>')
@language_choice_required
def get_next_lesson(skill):
    current_user = User.query.get(1) # TODO
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
    incomplete = [lesson for lesson in skill.lessons if lesson.id not in completed_ids]
    lesson = min(incomplete, key=lambda l: l.level) if incomplete else random.choice(list(skill.lessons))
    return jsonify({
        'name': skill.name,
        'language': skill.language.name,
        'lesson_id': lesson.id,
        'questions': [q.data for q in lesson.questions],
    })

@app.route('/complete_lesson/<Lesson:lesson>', methods=['POST'])
@language_choice_required
def complete_lesson(lesson):
    current_user = User.query.get(1) # TODO
    skill = lesson.skill
    skill_level = current_user.get_skill_level(skill)
    all_completed = current_user.lessons_completed
    
    if skill_level.level < lesson.level:
        ids_completed = {
            l.id
            for l in all_completed
            if l.lesson.skill_id == skill.id and l.lesson.level == lesson.level
        }
        if lesson.id not in ids_completed:
            lessons_in_skill = skill.lessons.filter_by(level=lesson.level).count()
            skill_level.progress = (len(ids_completed) + 1) / lessons_in_skill
            if lessons_in_skill == len(ids_completed) + 1:
                skill_level.level = lesson.level
                if skill.lessons.filter(Lesson.level > lesson.level).count() > 0:
                    skill_level.progress = 0
    
    completion = current_user.get_lesson_completion(lesson)
    completion.number_of_times += 1
    
    db.session.commit()
    return jsonify(skill_stats(current_user, lesson.skill))
