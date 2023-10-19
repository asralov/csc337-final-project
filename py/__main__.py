from newsapi import NewsApiClient
import requests
from newspaper import Article
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

nltk.download('vader_lexicon')

# If we pool are requests together than we can get 4,000 requests per hour
api_key = 'API_KEY'  
newsapi = NewsApiClient(api_key=api_key)

def fetch_trending_articles(stories):
    # Get the top stories which are not in the database
    pass

def sumarize(stories):
    # Sumarize the stories to small strings of text
    pass

def get_stories():
    # Get the stories from the database
    pass

def get_sentiment(stories):
    # Get sentiment of a list of stories
    pass

def fetch_news(search_query, api_key, page_size=10):
    # Return sum of the sentiment score in JSON {title: query, URLs: [], 
    #                                             pos: 0, neg: 0, neu: 0, compound: 0}
    pass

def sentiment_analysis(text):
    sid = SentimentIntensityAnalyzer()
    scores = sid.polarity_scores(text)
    return scores

def __main__():
    db_stories=get_stories()
    news = fetch_trending_articles()
    sumarized_queries=sumarize(db_stories,news)
    sentiment_JSON=[]
    for query in sumarized_queries:
        sentiment_JSON.append(fetch_news(query,api_key))
    requests.post('http://localhost:5000/api/sentiment', json=sentiment_JSON)

if __name__ == "__main__":
    __main__()