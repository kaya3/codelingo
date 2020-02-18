import re

import passwordmeter
from flask import jsonify, request
from flask_login import current_user, login_user, logout_user

from app import app, db
from app.models.user import User
from app.util.decorators import api_login_required, force_password_change
from app.util.mail import send_email

# TODO: don't do this later
api_login_required = language_choice_required = lambda f: f

@app.route('/')
def index():
    if not current_user.is_authenticated:
        return 'You are not logged in.', 401
    else:
        return 'Not found.', 404

@app.route('/api/login', methods=['POST'])
def user_login():
    if current_user.is_authenticated:
        return 'You are already logged in.', 400
    
    username = request.form.get('username', '')
    password = request.form.get('password', '')
    
    user = User.get_by_username(username) or User.get_by_email(username)
    if not user or not user.check_password(password):
        return 'Incorrect username or password.', 401
    else:
        login_user(user, remember=True)
        # commit in case temporary password status changed
        db.session.commit()
        return user_info(user)

@app.route('/api/who_am_i')
def who_am_i():
    current_user = User.query.get(1) # TODO
    if current_user.is_authenticated:
        return user_info(current_user)
    else:
        return jsonify(None)

@app.route('/api/user_info/<User:user>')
def user_info(user):
    return jsonify({
        'id': user.id,
        'username': user.username,
        'language': user.current_language.name if user.current_language else None,
    })

@app.route('/api/register', methods=['POST'])
def user_register():
    username = request.form.get('username', '')
    email = request.form.get('email', '')
    
    if not re.match('^[a-zA-Z0-9]+$', username):
        return 'Invalid username; must use only letters and digits.', 400
    elif '@' not in email:
        return 'Invalid email address.', 400
    elif User.get_by_username(username):
        return 'Username already registered.', 400
    elif User.get_by_email(email):
        return 'Email address already registered.', 400
    
    user = User(username, email)
    tmp_pw = user.generate_tmp_password()
    
    send_email(
        recipients=[email],
        template='verify_email',
        subject='Codelingo: verify your email address',
        username=username,
        tmp_pw=tmp_pw
    )
    
    db.session.commit()
    return jsonify({})

@app.route('/api/reset_password', methods=['POST'])
def user_reset_password():
    username = request.form.get('username', '')
    
    user = User.get_by_username(username) or User.get_by_email(username)
    if user:
        tmp_pw = user.generate_tmp_password()
        send_email(
            recipients=[user.email],
            template='reset_password',
            subject='Codelingo: reset password',
            username=username,
            tmp_pw=tmp_pw
        )
        db.session.commit()
    
    return jsonify({})

@app.route('/api/logout', methods=['POST'])
@api_login_required
def user_logout():
    logout_user()
    return jsonify({})

@app.route('/api/change_password', methods=['GET', 'POST'])
@api_login_required
def change_password():
    old_pw = request.form.get('old_password', '')
    new_pw1 = request.form.get('new_password1', '')
    new_pw2 = request.form.get('new_password2', '')
    
    min_pw_length = app.config['PASSWORD_MIN_LENGTH']
    min_pw_strength = app.config['PASSWORD_MIN_STRENGTH']
    
    pw_strength, improvements = passwordmeter.test(new_pw1)
    if len(new_pw1) < min_pw_length:
        pw_strength = 0
        improvements['length'] = 'Your password should be at least %d characters long' % min_pw_length
    
    if new_pw1 != new_pw2:
        return jsonify({
            'error': '<p>You did not enter the password the same way twice - perhaps a typo?</p>'
        }), 400
    elif pw_strength < min_pw_strength:
        return jsonify({
            'error': '<p>Your new password is not strong enough. Here are some ways you could improve it:</p>'
                + '<ul>'
                + ''.join('<li>' + msg + '.</li>' for msg in improvements.values())
                + '</ul>'
        }), 400
    elif not current_user.set_password(old_password=old_pw, new_password=new_pw1):
        return jsonify({
            'error': '<p>Incorrect current password.</p>'
        }), 401
    else:
        db.session.commit()
        return jsonify({})
