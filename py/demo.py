from newsapi import NewsApiClient
from newspaper import Article
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

nltk.download('vader_lexicon')

def fetch_news(search_query, api_key, page_size=1):
    # Init
    newsapi = NewsApiClient(api_key=api_key)

    # /v2/everything endpoint
    all_articles = newsapi.get_everything(q=search_query,
                                          language='en',
                                          sort_by='relevancy',
                                          page_size=page_size)

    articles = all_articles['articles']
    return [(article['title'], article['url']) for article in articles]

def sentiment_analysis(text):
    sid = SentimentIntensityAnalyzer()
    scores = sid.polarity_scores(text)
    return scores

# Example usage
api_key = 'YOUR_API_KEY'  # replace with your NewsAPI key
search_query = 'Gaza'  # replace with your query
articles = fetch_news(search_query, api_key)

for i, (title, url) in enumerate(articles):
    article = Article(url)
    article.download()
    article.parse()
    text = article.text
    sentiment = sentiment_analysis(text)
    print(f"Title: {title}\nURL: {url}\nSentiment: {sentiment}\n")
