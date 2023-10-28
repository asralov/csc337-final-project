import os
import openai
from newspaper import Article
from newspaper import Config
from newsapi import NewsApiClient
from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Initalize API keys and other variables
news_api_key = os.environ.get('NEWSAPI_KEY')
openai_api_key = os.environ.get('OPENAI_API_KEY')
SID = SentimentIntensityAnalyzer()

class Topic:
    def __init__(self, search_term):
        """Take a search term and generate a story from it
        Arguments:
            search_term {str} -- The term to search for
        Use: Find stories for specfic topics and summarize them
        """
        self._term=search_term
        self._articles=self.get_articles(search_term,10) 
        self._stories=self.stories()

    def get_articles(self, term:str, n:int):
        newsapi = NewsApiClient(api_key=news_api_key)
        articles = newsapi.get_everything(q=self._term,
                                        language='en',
                                        sort_by='relevancy',
                                        page_size=n)
        
        articles = [{"title": article['title'], "url": article['url'], "sentiment": 0, "text": ""} for article in articles['articles']]
        
        for article_dict in articles:
            config = Config()
            config.browser_user_agent = 'Mozilla/5.0...'
            article = Article(article_dict['url'], config=config)
            article.download()
            article.parse()
            article_dict['text'] = article.text
            sentiment_scores = SID.polarity_scores(article.text)
            article_dict['sentiment'] = sentiment_scores['compound']

        return articles


    
    def print_articles(self):
        """Print the articles in the format:
        i : title : url
        """
        for i, key in enumerate(self._articles):
            print(f"{i} : {key['title']} : {key['url']}")

    def stories(self):
        # TODO - Summarize articles and generate story(s)
        # Send similiar articles for GPT-3 to generate a story
        # Send stories to Mongo for JS to display
        pass