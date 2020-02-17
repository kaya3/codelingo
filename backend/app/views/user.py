import re
import passwordmeter

from flask import request, jsonify
from flask_login import login_user, logout_user, current_user, login_required

from app import app, db
from app.util.decorators import force_password_change
from app.util.mail import send_email
from app.models.user import User

# TODO: don't do this later
language_choice_required = login_required = lambda f: f

@app.route('/login', methods=['POST'])
def user_login():
    if current_user.is_authenticated:
        return 'You are already logged in.', 400
    
    username = request.form['username']
    password = request.form['password']
    
    user = User.get_by_username(username) or User.get_by_email(username)
    if not user or not user.check_password(password):
        return 'Incorrect username or password.', 401
    else:
        login_user(user, remember=True)
        return user_info(user)

@app.route('/who_am_i')
def who_am_i():
    current_user = User.query.get(1) # TODO
    if current_user.is_authenticated:
        return user_info(current_user)
    else:
        return jsonify(None)

@app.route('/user_info/<User:user>')
def user_info(user):
    return jsonify({
        'username': user.username,
        'language': user.current_language.name if user.current_language else None,
    })

@app.route('/register', methods=['POST'])
def user_register():
    if 'username' not in request.form:
        return 'Missing username.', 400
    elif 'email' not in request.form:
        return 'Missing email address.', 400
    
    username = request.form['username']
    email = request.form['email']
    
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
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({})

@app.route('/reset_password', methods=['POST'])
def user_reset_password():
    username = request.form['username']
    
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
        db.session.add(user)
        db.session.commit()
    
    return jsonify({})

@app.route('/logout', methods=['POST'])
@login_required
def user_logout():
    logout_user()
    return jsonify({})

@app.route('/change_password', methods=['GET', 'POST'])
@login_required
def change_password():
    if 'old_password' not in request.form:
        return 'Missing old password.', 400
    elif 'new_password1' not in request.form:
        return 'Missing new password.', 400
    elif 'new_password2' not in request.form:
        return 'Missing repeated new password.', 400
    
    old_pw = request.form['old_password']
    new_pw1 = request.form['new_password1']
    new_pw2 = request.form['new_password2']
    
    min_pw_length = app.config['PASSWORD_MIN_LENGTH']
    min_pw_strength = app.config['PASSWORD_MIN_STRENGTH']
    
    pw_strength, improvements = passwordmeter.test(new_pw1)
    if len(new_pw1) < min_pw_length:
        pw_strength = 0
        improvements['length'] = 'Your password should be at least %d characters long' % min_pw_length
    
    if new_pw1 != new_pw2:
        return jsonify({
            'error': 'You did not enter the password the same way twice - perhaps a typo?'
        }), 400
    elif pw_strength < min_pw_strength:
        return jsonify({
            'error': '<p>Your new password is not strong enough. Here are some ways you could improve it:</p>'
                + '<ul>'
                + ''.join([ '<li>' + msg + '.</li>' for msg in improvements.values() ])
                + '</ul>'
        }), 400
    elif not current_user.set_password(old_password=old_pw, new_password=new_pw1):
        return jsonify({
            'error': 'Incorrect current password.'
        }), 401
    else:
        db.session.add(current_user)
        db.session.commit()
        return jsonify({})
