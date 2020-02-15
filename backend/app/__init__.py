from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail
from flask_login import LoginManager, current_user

app = Flask(__name__)
app.config.from_object('config')
app.secret_key = app.config['SECRET_KEY']
app.debug = app.config['DEBUG_MODE']

db = SQLAlchemy(app)
mail = Mail(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'index'

@app.route('/')
def index():
	if not current_user.is_authenticated:
		return jsonify({ 'error': 'You are not logged in.' }), 401
	else:
		return jsonify({ 'error': 'Not found.' }), 404

from app import views, models

@login_manager.user_loader
def load_user(user_id):
	return models.User.query.get(int(user_id))

