__all__ = ['LessonCompleted', 'SkillLevel']

from app import app, db

class LessonCompleted(db.Model):
	__tablename__ = 'lessonscompleted'
	id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
	number_of_times = db.Column('number_of_times', db.Integer, default=0)
	
	user_id = db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=True)
	lesson_id = db.Column('lesson_id', db.Integer, db.ForeignKey('lessons.id'), nullable=True)
	
	def __init__(self, user, lesson):
		self.user = user
		self.lesson = lesson

class SkillLevel(db.Model):
	__tablename__ = 'skilllevels'
	id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
	level = db.Column('level', db.Integer)
	progress = db.Column('progress', db.Float)
	
	user_id = db.Column('user_id', db.Integer, db.ForeignKey('users.id'), nullable=True)
	skill_id = db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), nullable=True)
	
	def __init__(self, user, skill, level=0, progress=0):
		self.level = level
		self.progress = progress
		self.user = user
		self.skill = skill
