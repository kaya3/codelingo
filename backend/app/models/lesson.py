__all__ = ['Language', 'Skill', 'Lesson', 'Question']

import json

from app import app, db
from app.util.decorators import db_mapped

@db_mapped
class Language(db.Model):
    __tablename__ = 'languages'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('name', db.String, index=True)
    
    users = db.relationship('User', backref='current_language', lazy='dynamic')
    skills = db.relationship('Skill', backref='language', lazy='dynamic')
    
    def __init__(self, name):
        self.name = name
    
    @property
    def title(self):
        return self.name.title()

@db_mapped
class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('name', db.String)
    language_id = db.Column('language_id', db.Integer, db.ForeignKey('languages.id'), nullable=False)
    order = db.Column('order', db.Integer)
    
    lessons = db.relationship('Lesson', backref='skill', lazy='dynamic')
    user_levels = db.relationship('SkillLevel', backref='skill', lazy='dynamic')
    
    def __init__(self, name, language, order):
        self.name = name
        self.language = language
        self.order = order

@db_mapped
class Lesson(db.Model):
    __tablename__ = 'lessons'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    level = db.Column('level', db.Integer)
    
    skill_id = db.Column('skill_id', db.Integer, db.ForeignKey('skills.id'), nullable=False)
    questions = db.relationship('Question', backref='lesson', lazy='dynamic')
    users_completed = db.relationship('LessonCompleted', backref='lesson', lazy='dynamic')
    
    def __init__(self, skill, level):
        self.skill = skill
        self.level = level

@db_mapped
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
