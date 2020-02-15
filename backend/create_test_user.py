#!/usr/bin/python3

import json

from app import app, db
from app.models import *

user1 = User('alice', 'alice@example.com', 'test')
user2 = User('bob', 'bob@example.com', 'test')
user3 = User('clive', 'clive@example.com', 'test')

skill = Skill('Lists', 1)

lesson1 = Lesson(skill, 1)
lesson2 = Lesson(skill, 2)

q1 = Question(lesson1, json.dumps({
	'kind': 'blocks',
	'text': '<p>Find the sum of the numbers in <code>nums</code>.</p>',
	'correct': 'sum ( nums )'.split(),
	'incorrect': 'total [ ]'.split(),
}))
q2 = Question(lesson1, json.dumps({
	'kind': 'multiple_choice',
	'text': '<p>What is the result of <code>sum([2, 5])</code>?</p>',
	'options': '7 2 5'.split(),
}))
q3 = Question(lesson2, json.dumps({
	'kind': 'blanks',
	'text': '<p>Complete the code to print each number from <code>nums</code>.</p>',
	'template': 'for ### in nums:\n\t###(x)',
	'correct': ['x', 'print'],
	'incorrect': ['sum', 'output', 'nums'],
}))

db.session.add_all([
	user1, user2, user3,
	skill,
	lesson1, lesson2,
	q1, q2, q3
])
db.session.commit()
