__all__ = ['send_email']

from flask import render_template
from flask_mail import Message
from app import app, mail
from app.util.decorators import run_in_thread

NOREPLY_ADDRESS = app.config['NOREPLY_ADDRESS']

@run_in_thread
def send_email(recipients, template, subject, sender=NOREPLY_ADDRESS, **kwargs):
    msg = Message(subject, sender=sender, recipients=recipients)
    msg.body = render_template('mail/' + template + '.txt', subject=subject, **kwargs)
    msg.html = render_template('mail/' + template + '.html', subject=subject, **kwargs)
    if app.debug:
        app.logger.info(
            'Would send email to ' + repr(recipients) + '\n'
            + 'From: ' + sender + '\n'
            + 'Subject: ' + subject + '\n'
            + msg.body
        )
    else:
        with app.app_context():
            mail.send(msg)
