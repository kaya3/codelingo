#!/usr/bin/python3

from migrate.versioning import api
from config import SQLALCHEMY_DATABASE_URI
from config import SQLALCHEMY_MIGRATE_REPO
from app import app, db

import os
if app.config['DEBUG_MODE']:
	os.system('rm app.db')
	os.system('rm -rf db_repository/')

db.create_all()
if not os.path.exists(SQLALCHEMY_MIGRATE_REPO):
	api.create(SQLALCHEMY_MIGRATE_REPO, 'database repository')
	api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO)
else:
	api.version_control(SQLALCHEMY_DATABASE_URI, SQLALCHEMY_MIGRATE_REPO, api.version(SQLALCHEMY_MIGRATE_REPO))

#if app.config['DEBUG_MODE']:
#	from app.models.user import User
#	u = User('andrew', 'kaya3@aston.ac.uk', 'test')
#	db.session.add(u)
#	db.session.commit()

