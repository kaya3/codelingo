from app import app, db
from flask import session, request, flash, url_for, redirect, render_template, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from app.decorators import force_password_change
from sqlalchemy import func

from app.models.user import User

@app.route('/login', methods=['POST'])
def login():
	if current_user.is_authenticated:
		return 'You are already logged in.', 400
	username = request.form['username']
	password = request.form['password']
	action = request.form['action']
	
	if '@' in username:
		col = User.email
	else:
		col = User.username
	registered_user = User.query.filter(func.lower(col) == func.lower(username)).first()
	
	if action == 'log in':
		if registered_user is None or not registered_user.check_password(password):
			flash('Incorrect username/email or password.', category='error')
		else:
			login_user(registered_user, remember=True)
	elif action == 'reset password':
		if not username:
			flash('You did not enter an email/username', category='error')
		else:
			if registered_user is not None:
				tmp_pw = registered_user.generate_tmp_password()
				from app.mail import send_email
				send_email(
					recipients=[registered_user.email],
					template='reset_password',
					subject='Codelingo: reset password',
					username=username,
					tmp_pw = tmp_pw
				)
				db.session.add(registered_user)
				db.session.commit()
			flash('If that account exists, then a temporary password has been sent to the email address associated with it.\n' \
				+ 'If you do not receive this by email within the next few minutes, please check that you have entered your username/email correctly.')	
	else:
		return 'Invalid action', 400
	return redirect(url_for('index'))

@app.route('/logout', methods=['POST'])
@login_required
def logout():
	logout_user()
	return redirect(url_for('index'))

@app.route('/change_password', methods=['GET', 'POST'])
@login_required
def change_password():
	if 'old_password' in request.form:
		old_pw = request.form['old_password']
		new_pw1 = request.form['new_password1']
		new_pw2 = request.form['new_password2']
		
		min_pw_length = app.config['PASSWORD_MIN_LENGTH']
		min_pw_strength = app.config['PASSWORD_MIN_STRENGTH']
		
		import passwordmeter
		pw_strength, improvements = passwordmeter.test(new_pw1)
		if len(new_pw1) < min_pw_length:
			pw_strength = 0
			improvements['length'] = 'Your password should be at least ' + str(min_pw_length) + ' characters long'
		
		if not current_user.check_password(old_pw):
			flash('Incorrect current password.', category='error')
		elif new_pw1 != new_pw2:
			flash('You did not enter the password the same way twice - perhaps a typo?', category='error')
		elif pw_strength < min_pw_strength:
			flash('<p>Your new password is not strong enough. Here are some ways you could improve it:</p><ul>' + ''.join([ '<li>'+msg+'.</li>' for msg in improvements.values() ]) + '</ul>', category='error')
		elif current_user.set_password(new_pw1, old_pw):
			db.session.add(current_user)
			db.session.commit()
			flash('Password changed successfully.')
			return redirect(url_for('index'))
		else:
			return 'Unknown error', 500
	return render_template('change_password.html')
