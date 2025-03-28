import re
import models, app, json
from collections import Counter

OUTPUT_PATH = "custom_dictionary.txt"

def tokenize(text: str):
    return re.findall(r"\b[a-zA-Z]+(?:['-][a-zA-Z]+)*\b", text.lower())

def extract_text_from_slate(content_json: str) -> str:
    try:
        nodes = json.loads(content_json)
    except Exception:
        return ""

    def walk(nodes):
        text_chunks = []
        for node in nodes:
            if "text" in node:
                text_chunks.append(node["text"])
            elif "children" in node:
                text_chunks.extend(walk(node["children"]))
        return text_chunks

    return " ".join(walk(nodes))


def build_dictionary():
    '''Builds a dictionary text file based on the articles in the database. Should run after every article edit.'''
    word_counts = Counter()

    with app.app.app_context():
        articles: models.Article = models.Article.query.with_entities(
            models.Article.Title,
            models.Article.Content,
            models.Article.Article_Description
        ).all()

        for title, content, description in articles:
            fields = [title, description]
            if content:
                fields.append(extract_text_from_slate(content))
            for field in fields:
                if field:
                    word_counts.update(tokenize(field))

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        for word, count in word_counts.items():
            f.write(f"{word}\t{count}\n")

    print(f"SymSpell dictionary saved to {OUTPUT_PATH}")


