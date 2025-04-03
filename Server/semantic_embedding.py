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

def embed_query(query: str):
    return model.encode(query)

def find_match(query: str, min_score = 0.5):
    embedded_query = embed_query(query)
    embeddings = load_article_embeddings()
    
    similarities = {}
    for article_id, vec in embeddings.items():
        similarity = np.dot(embedded_query, vec) / (np.linalg.norm(embedded_query) * np.linalg.norm(vec))
        similarities[article_id] = similarity

    return similarities

def hybrid_search(tfidf_scores: list[tuple], query: str, alpha=0.6, min_score = 0.3, top_n=10) -> list[tuple]:
    '''Combine tf-idf scores with semantic match scores to find matches we could have otherwise missed'''
    tfidf_score_dict = {id: score for id, score in tfidf_scores}
    norm_tfidf_score_dict = normalize_scores(tfidf_score_dict)
    print(norm_tfidf_score_dict)
    semantic_score_dict = find_match(query)
    norm_semantic_score_dict = normalize_scores(semantic_score_dict)

    combined = {}
    all_ids = set(norm_tfidf_score_dict) | set(norm_semantic_score_dict)
    for id in all_ids:
        tfidf_score = norm_tfidf_score_dict.get(id)
        semantic_score = norm_semantic_score_dict.get(id)
        combined_score = alpha * tfidf_score + (1-alpha) * semantic_score

        if combined_score >= min_score:
            combined[id] = combined_score
    
    top_matches = sorted(combined.items(), key=lambda x: x[1], reverse=True)[:top_n]
    print(top_matches)
    return top_matches

def normalize_scores(results: dict[int, float]) -> dict[int, float]:
    scores = list(results.values())
    min_score = min(scores)
    max_score = max(scores)
    range = max_score - min_score if max_score != min_score else 1.0

    return {
        k: (v - min_score) / range for k, v in results.items()
    }