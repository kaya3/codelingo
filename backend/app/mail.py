from flask import render_template
from flask_mail import Message
from app import app, mail
from .decorators import run_in_thread

noreply_address = app.config['NOREPLY_ADDRESS']

def send_email(recipients, template, subject, sender=noreply_address, **kwargs):
	msg = Message(subject, sender=sender, recipients=recipients)
	msg.body = render_template('mail/' + template + '.txt', subject=subject, **kwargs)
	msg.html = render_template('mail/' + template + '.html', subject=subject, **kwargs)
	if app.debug:
		app.logger.info('Would send email to ' + repr(recipients) + '\n'
			+ 'From: ' + sender + '\n'
			+ 'Subject: ' + subject + '\n'
			+ msg.body
		)
	else:
		def send_mail():
			with app.app_context():
				mail.send(msg)
		run_in_thread(send_mail)
