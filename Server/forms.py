from flask_wtf import FlaskForm
from wtforms.fields import StringField, IntegerField, SubmitField, SelectField, FloatField
from wtforms.validators import InputRequired, Optional

class ArticleForm(FlaskForm):    
    # You will need to update the value of choices after creating an instance 
    # of your form in your handler. This is noted in app.py as well.
    title = StringField("Title: ", vaidators=[InputRequired()])
    # TODO: add fields with validators for title and year
    content = StringField("Content: ", validators=[InputRequired()])
    description = StringField("Description: ", validators=[InputRequired()])
    image_name = StringField("Image name: ", validators=[InputRequired()])
    good = IntegerField("Number of Good reviews: ", validators=[InputRequired()])
    bad = IntegerField("Number of Bad reviews: ", validators=[InputRequired()])
    usefulness = FloatField("Usefulness: ", validators=[InputRequired()])
    submit = SubmitField("Submit")