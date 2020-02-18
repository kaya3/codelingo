__all__ = ['User']

from passlib.utils import generate_password
from sqlalchemy import func

from app import app, db
from app.models.progress import LessonCompleted, SkillLevel
from app.util.decorators import db_mapped

HASH_API = app.config['PASSWORD_HASH_API']
HASH_ROUNDS = app.config['PASSWORD_HASH_ROUNDS']
DEFAULT_PASSWORD_LENGTH = app.config['DEFAULT_PASSWORD_LENGTH']

@db_mapped
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    username = db.Column('username', db.String(128), index=True, unique=True, nullable=False)
    email = db.Column('email', db.String, index=True, unique=True, nullable=False)
    
    db.Index('index_users_username', func.lower(username), unique=True)
    db.Index('index_users_email', func.lower(email), unique=True)
    
    password_hash = db.Column('password_hash', db.String, nullable=False)
    tmp_password_hash = db.Column('tmp_password_hash', db.String, nullable=True)
    require_change_password = db.Column('require_change_password', db.Boolean, default=False, nullable=False)
    
    current_language_id = db.Column('current_language_id', db.Integer, db.ForeignKey('languages.id'), nullable=True)
    lessons_completed = db.relationship('LessonCompleted', backref='user', lazy='dynamic')
    skill_levels = db.relationship('SkillLevel', backref='user', lazy='dynamic')
    
    @staticmethod
    def get_by_username(username):
        return User.query.filter(func.lower(User.username) == func.lower(username)).one_or_none()
    
    @staticmethod
    def get_by_email(username):
        return User.query.filter(func.lower(User.email) == func.lower(username)).one_or_none()
    
    def __init__(self, username, email, new_password=None):
        self.username = username
        self.email = email
        self.tmp_password = None
        self.current_language = None
        
        if new_password is None:
            self.generate_tmp_password()
            self.password_hash = 'Not a password hash'
        else:
            self.password_hash = HASH_API.encrypt(new_password, rounds=HASH_ROUNDS)
    
    def is_authenticated(self):
        return True
    def is_active(self):
        return self.require_change_password
    def is_anonymous(self):
        return False
    def get_id(self):
        return str(self.id)
    
    def check_password(self, password):
        if self.tmp_password_hash and HASH_API.verify(password, self.tmp_password_hash):
            self.password_hash = self.tmp_password_hash
            self.tmp_password_hash = None
            self.require_change_password = True
            return True
        elif HASH_API.verify(password, self.password_hash):
            if self.tmp_password_hash:
                self.tmp_password_hash = None
                self.require_change_password = False
            return True
        else:
            return False
    
    def set_password(self, *, old_password, new_password):
        if self.check_password(old_password):
            self.password_hash = HASH_API.encrypt(new_password, rounds=HASH_ROUNDS)
            self.tmp_password_hash = None
            self.require_change_password = False
            return True
        else:
            return False
    
    def generate_tmp_password(self):
        new_password = generate_password(DEFAULT_PASSWORD_LENGTH)
        self.tmp_password_hash = HASH_API.encrypt(new_password, rounds=HASH_ROUNDS)
        return new_password
    
    def get_skill_level(self, skill):
        skill_level = self.skill_levels.filter_by(skill_id=skill.id).one_or_none()
        return skill_level or SkillLevel(self, skill)
    
    def get_lesson_completion(self, lesson):
        completion = self.lessons_completed.filter_by(lesson_id=lesson.id).one_or_none()
        return completion or LessonCompleted(self, lesson)
