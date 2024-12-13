from flask_wtf import FlaskForm
from wtforms.fields import StringField, IntegerField, SubmitField, SelectField, FloatField
from wtforms.validators import InputRequired, Optional

class ArticleForm(FlaskForm):    
    # You will need to update the value of choices after creating an instance 
    # of your form in your handler. This is noted in app.py as well.
    title = StringField("Title: ", validators=[InputRequired()])
    # TODO: add fields with validators for title and year
    content = StringField("Content: ")
    description = StringField("Description: ")
    image_name = StringField("Image name: ")
    submit = SubmitField("Submit")