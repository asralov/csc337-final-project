import os
import re
from newsapi import NewsApiClient
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
import numpy as np

# Initialize API keys
news_api_key = os.environ.get("NEWSAPI_KEY")


class KeyWords:
    def __init__(self, country, category):
        self._country = country
        self._category = category
        self._articles = self.get_headline_titles()

    def get_headline_titles(self):
        titles = []
        newsapi = NewsApiClient(api_key=news_api_key)
        api_response = newsapi.get_top_headlines(
            language="en", country=self._country, category=self._category, page_size=100
        )
        for article in api_response["articles"]:
            if article["title"] not in titles:
                titles.append(article["title"])
        return titles

    def find_key_phrases(self, top_n, ngram_range=(1, 3)):
        # Preprocess headlines
        processed_headlines = [self.preprocess_text(title) for title in self._articles]

        # Create TF-IDF matrix with n-grams
        vectorizer = TfidfVectorizer(ngram_range=ngram_range)
        tfidf_matrix = vectorizer.fit_transform(processed_headlines)

        # Extract key phrases for each headline
        key_phrases = []
        feature_names = np.array(vectorizer.get_feature_names_out())
        for row in tfidf_matrix:
            # Sort indices of features in row by their TF-IDF values
            sorted_indices = np.argsort(row.toarray()).flatten()[::-1]

            # Extract top N features with highest TF-IDF scores
            top_n_indices = sorted_indices[:top_n]
            top_features = feature_names[top_n_indices]
            key_phrases.append(top_features)

        return key_phrases

    def find_cumulative_key_phrases(self, ngram_range=(1, 3), top_n=5):
        # Concatenate all headlines into a single document
        concatenated_headlines = " ".join(
            [self.preprocess_text(title) for title in self._articles]
        )

        # Create TF-IDF matrix for the concatenated document with n-grams
        vectorizer = TfidfVectorizer(ngram_range=ngram_range)
        tfidf_matrix = vectorizer.fit_transform([concatenated_headlines])

        # Extract top N phrases with highest TF-IDF scores
        feature_names = np.array(vectorizer.get_feature_names_out())
        sorted_indices = np.argsort(tfidf_matrix.toarray()).flatten()[::-1]
        top_n_indices = sorted_indices[:top_n]
        top_phrases = feature_names[top_n_indices]

        return top_phrases

    def find_key_words(self):
        # Concatenate all headlines into a single document
        concatenated_headlines = " ".join(
            [self.preprocess_text(title) for title in self._articles]
        )

        # Create TF-IDF matrix for the concatenated document
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([concatenated_headlines])

        # Extract top 20 keywords
        feature_names = np.array(vectorizer.get_feature_names_out())
        sorted_indices = np.argsort(tfidf_matrix.toarray()).flatten()[::-1]
        top_20_indices = sorted_indices[:50]
        top_keywords = feature_names[top_20_indices]

        return top_keywords

    def preprocess_text(self, text):
        text = text.lower()
        text = re.sub(r"\W", " ", text)
        stop_words = set(stopwords.words("english"))
        words = text.split()
        words = [word for word in words if word not in stop_words]
        return " ".join(words)


# Create an instance of the KeyWords class
country = "us"
category = "general"
keyword_extractor = KeyWords(country, category)

# Find and print cumulative key phrases
cumulative_key_phrases = keyword_extractor.find_cumulative_key_phrases(top_n=50)
print("Top Cumulative Phrases:")
print(", ".join(cumulative_key_phrases))

