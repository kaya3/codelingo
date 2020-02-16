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

"""
skill = Skill('Lists', language, 1)

lesson1 = Lesson(skill, 1)
#lesson2 = Lesson(skill, 2)

q1 = Question(lesson1, {
	'kind': 'blocks',
	'text': '<p>Find the sum of the numbers in <code>nums</code>.</p>',
	'correct': 'sum ( nums )'.split(),
	'incorrect': 'total [ ]'.split(),
})
q2 = Question(lesson1, {
	'kind': 'multiple_choice',
	'text': '<p>What is the result of <code>sum([2, 5])</code>?</p>',
	'correct': ['7'],
	'incorrect': ['2', '5'], 
})
q3 = Question(lesson1, {
	'kind': 'blanks',
	'text': '<p>Complete the code to print each number from <code>nums</code>.</p>',
	'template': 'for ### in nums:\n\t###(x)'.split('###'),
	'correct': ['x', 'print'],
	'incorrect': ['sum', 'output', 'nums'],
})
"""

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
