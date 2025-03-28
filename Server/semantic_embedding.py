import os, json
import numpy as np
from sentence_transformers import SentenceTransformer
from models import Article
from app import app

MODEL_NAME = "all-MiniLM-L6-v2"
EMBEDDING_PATH = "article_embeddings.json"

model = SentenceTransformer(MODEL_NAME)

def extract_text(article: Article) -> str:
    parts = [article.Title, article.Article_Description]
    if article.Content:
        try:
            def walk(nodes):
                for node in nodes:
                    if "text" in node:
                        yield node["text"]
                    elif "children" in node:
                        yield from walk(node["children"])
            parts.append(" ".join(walk(json.loads(article.Content))))
        except Exception:
            pass
    return " ".join(p for p in parts if p)

def build_embeddings():
    with app.app_context():
        articles = Article.query.all()
        text_map = {str(article.ID): extract_text(article) for article in articles}
        embeddings = model.encode(list(text_map.values()), convert_to_numpy=True)

        id_to_vec = {
            article_id: embedding.tolist() for article_id, embedding in zip(text_map.keys(), embeddings)
        }

        with open(EMBEDDING_PATH, "w", encoding="utf-8") as f:
            json.dump(id_to_vec, f)
        
        print(f"Saved {len(id_to_vec)} embeddings to {EMBEDDING_PATH}")

def load_article_embeddings():
    with open(EMBEDDING_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        id_to_vec = {int(k): np.array(v) for k, v in data.items()}
    return id_to_vec
