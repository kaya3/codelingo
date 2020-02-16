#!/usr/bin/python3

LANGUAGES = ['python']

from app import app, db
from app.models import *
import json

user1 = User('alice', 'alice@example.com', 'test')
user2 = User('bob', 'bob@example.com', 'test')
user3 = User('clive', 'clive@example.com', 'test')

languages = { name: Language(name) for name in LANGUAGES }
user1.current_language = languages['python']
user2.current_language = languages['python']

db.session.add_all([
	user1, user2, user3,
	*languages.values(),
])

for lang in LANGUAGES:
	with open('../lessons/' + lang + '.json') as f:
		data = json.loads(f.read())
	
	for s in data:
		skill = Skill(s['skill'], languages[lang], s['order'])
		db.session.add(skill)
		for l in s['lessons']:
			lesson = Lesson(skill, l['level'])
			db.session.add(lesson)
			for q in l['questions']:
				question = Question(lesson, q)
				db.session.add(question)

db.session.commit()
