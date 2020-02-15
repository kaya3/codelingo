__all__ = ['User']

from app import app, db
from flask import url_for

hash_api = app.config['PASSWORD_HASH_API']
hash_rounds = app.config['PASSWORD_HASH_ROUNDS']
default_password_length = app.config['DEFAULT_PASSWORD_LENGTH']

class User(db.Model):
	__tablename__ = 'users'
	id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
	username = db.Column('username', db.String(128), index=True, unique=True, nullable=False)
	email = db.Column('email', db.String, index=True, unique=True, nullable=False)
	
	password_hash = db.Column('password_hash', db.String, nullable=False)
	tmp_password_hash = db.Column('tmp_password_hash', db.String, nullable=True)
	require_change_password = db.Column('require_change_password', db.Boolean, default=False, nullable=False)
	
	current_language_id = db.Column('current_language_id', db.Integer, db.ForeignKey('languages.id'), nullable=True)
	
	def __init__(self, username, email, new_password=None):
		self.username = username
		self.email = email
		self.tmp_password = None
		self.current_language = None
		
		if new_password is None:
			self.generate_tmp_password()
			self.password_hash = 'Not a password hash'
		else:
			self.password_hash = hash_api.encrypt(new_password, rounds=hash_rounds)
	
	def is_authenticated(self):
		return True
	def is_active(self):
		return self.require_change_password
	def is_anonymous(self):
		return False
	def get_id(self):
		return str(self.id)
	
	def check_password(self, password):
		if self.tmp_password_hash is not None and self.check_tmp_password(password):
			self.password_hash = self.tmp_password_hash
			self.tmp_password_hash = None
			self.require_change_password = True
			db.session.add(self)
			db.session.commmit()
			return True
		if hash_api.verify(password, self.password_hash):
			if self.tmp_password_hash is not None:
				self.tmp_password_hash = None
				self.require_change_password = False
				db.session.add(self)
				db.session.commit()
			return True
		return False
	def check_tmp_password(self, password):
		return hash_api.verify(password, self.tmp_password_hash)
	def set_password(self, new_password, old_password):
		if not self.check_password(old_password):
			return False
		
		self.password_hash = hash_api.encrypt(new_password, rounds=hash_rounds)
		self.tmp_password_hash = None
		self.require_change_password = False
		return True
	def generate_tmp_password(self):
		from passlib.utils import generate_password
		new_password = generate_password(default_password_length)
		self.tmp_password_hash = hash_api.encrypt(new_password, rounds=hash_rounds)
		if app.debug:
			app.logger.info('Temporary password for ' + self.username + ' set to ' + new_password)
