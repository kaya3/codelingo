#!/usr/bin/python3

from app import app, db
from app.models.user import User

u = User('alice', 'alice@example.com', 'test')
v = User('bob', 'bob@example.com', 'test')
w = User('charles', 'charles@example.com', 'test')

