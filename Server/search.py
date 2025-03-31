import models
import numpy as np
import models, app, json
from build_dictionary import tokenize, extract_text_from_slate

def tf(term: str, fullArticle: list[str]) -> float:
    """Calculate term frequency of a word in an article."""

    articleWordCount = len(fullArticle)
    termCount = 0

    for word in fullArticle:
        if word == term:
            termCount += 1

    return termCount / float(articleWordCount)

def idf(term: str, fullArticles: list[list[str]]) -> float:
    """Given N articles, number of articles in which the the term appears for each term"""

    articleTermFrequency = 0

    for article in fullArticles:
        for word in article:
            if word == term:
                articleTermFrequency += 1
                break

    return float(np.log10(len(fullArticles) / articleTermFrequency))

def tfidf(query: list[str], articles: list[list[str]]):
    """TF * IDF per query term"""
    results = {}

    for article in articles:
        tfidfs = [
            tf(word, article) * idf(word, articles) for word in query
        ]

        results[int(article[0])] = sum(tfidfs)

    results = sorted(results.items(), key=lambda x: x[1], reverse=True)

    return results

def tfidf_search(query: list[str]):
    parsedArticles = list()

    with app.app.app_context():
        articles: list[models.Article] = models.Article.query.all()

        for article in articles:
            fullArticle: list[str] = [str(article.ID)]
            fullArticle.extend(tokenize(article.Title))
            fullArticle.extend(tokenize(article.Article_Description))
            fullArticle.extend(tokenize(extract_text_from_slate(article.Content)))
            parsedArticles.append(fullArticle)

    return tfidf(query, parsedArticles)

# def main():
#     query = "Connect GCC WiFi".lower().split(" ")
#     print(tfidf_search(query))

# if __name__ == "__main__":
#     main()