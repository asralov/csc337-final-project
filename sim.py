from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
import ssl

# Handling SSL certificate issues
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context


# Download stopwords
nltk.download('stopwords')

def compare_articles(article1, article2):
    # Initialize a TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(stop_words=stopwords.words('english'))

    # Fit and transform the articles
    tfidf_matrix = vectorizer.fit_transform([article1, article2])

    # Compute the cosine similarity
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

    return similarity[0][0]

# Sample articles
article1 = """Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals."""
article2 = """AI, or artificial intelligence, refers to machines that can perform tasks that typically require human intelligence."""

# Get similarity score
similarity_score = compare_articles(article1, article2)
print(f"Similarity Score: {similarity_score:.2f}")