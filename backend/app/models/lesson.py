__all__ = ['Skill', 'Lesson', 'Question']

from app import app, db

import json

class Skill(db.Model):
	__tablename__ = 'skills'
	id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
	name = db.Column('name', db.String)
	language = db.Column('language', db.String)
	order = db.Column('order', db.Integer)
	
	lessons = db.relationship('Lesson', backref='skill', lazy='dynamic')
	
	def __init__(self, name, language, order):
		self.name = name
		self.language = language
		self.order = order

class Lesson(db.Model):
	__tablename__ = 'lessons'
	id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
	level = db.Column('level', db.Integer)
	
	skill_id = db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), nullable=False)
	questions = db.relationship('Question', backref='lesson', lazy='dynamic')
	
	def __init__(self, skill, level):
		self.skill = skill
		self.level = level

class Question(db.Model):
	__tablename__ = 'questions'
	id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
	_data = db.Column('data', db.String)
	
	lesson_id = db.Column('lesson_id', db.Integer, db.ForeignKey('lessons.id'), nullable=False)
	
	def __init__(self, lesson, data):
		self.lesson = lesson
		self.data = data
	
	@property
	def data(self):
		return json.loads(self._data)
	
	@data.setter
	def data(self, data):
		self._data = json.dumps(data)
