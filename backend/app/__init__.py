from flask import Flask, jsonify
from flask_login import LoginManager, current_user
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
app.secret_key = app.config['SECRET_KEY']
app.debug = app.config['DEBUG_MODE']

db = SQLAlchemy(app)
mail = Mail(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'

from app import models, views

@login_manager.user_loader
def load_user(user_id):
    return models.User.query.get(int(user_id))
