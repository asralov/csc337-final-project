import os
import ssl
import nltk
import openai
from newsapi import NewsApiClient
from newspaper import Article
from newspaper import Config
from nltk.sentiment.vader import SentimentIntensityAnalyzer


# Initialize constants and download lexicon
NEWS_KEY = '68f1fe38b98f42e381f7e4b8ce258c9d'  # Make sure to use your actual NewsAPI key

# Handling SSL certificate issues
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Downloading necessary NLTK data
nltk.download('vader_lexicon')

def fetch_news(search_query, page_size=10):
    newsapi = NewsApiClient(api_key=NEWS_KEY)
    all_articles = newsapi.get_everything(q=search_query,
                                          language='en',
                                          sort_by='relevancy',
                                          page_size=page_size)
    return [(article['title'], article['url']) for article in all_articles['articles']]

def sentiment_analysis(text):
    sid = SentimentIntensityAnalyzer()
    scores = sid.polarity_scores(text)
    return scores

def gptSummarize(article_texts, query):
    # TODO: Get similarity of articles and summarize the most similar ones together until the imput text is short for the main GPT call

    openai.api_key = os.getenv('OPENAI_API_KEY')
    if openai.api_key is None:
        raise ValueError("Missing OpenAI API Key. Set it as an environment variable named 'OPENAI_API_KEY'")

    # Concatenate article texts, with a separator for clarity
    all_texts = "\n\n---\n\n".join(article_texts)

    # Input token limit is: 2048 max tokens for Davinci
    # Make a request to the OpenAI API to summarize the texts
    response = openai.Completion.create(
      engine="davinci",
      prompt=f"Please summarize the following articles about {query} into 3 main points and another 3 for why it is important:\n{all_texts}",
      max_tokens=500
    )
    summary = response.choices[0].text.strip()  # Extracting the text from the response
    return summary

def verify_article(articles, query):
    """Verify that the articles are relevant to the query"""
    texts = []
    query_terms = set(query.lower().split())
    score=0

    for i, (title, url) in enumerate(articles):
        config = Config()
        config.browser_user_agent = 'Mozilla/5.0...'
        article = Article(url, config=config)
        article.download()
        article.parse()
        text = article.text.lower()  # Convert text to lowercase for case-insensitive comparison
        score+=sentiment_analysis(text)["compound"]
        
        
        # TODO: Improve the logic to check for relevance 
        # Check if any of the query terms are in the title or the text
        if any(term in text or term in title.lower() for term in query_terms):
            texts.append(article.text)  # Original case text
        else:
            print(f"Article {i+1} '{title}' skipped due to irrelevance to the query.")

    return texts,score

def print_articles(articles):
    for title, url in articles:
        print(f"{title} - {url}")

def main():
    # Get user input and related news 
    search_query = input("Input a news topic: ")
    fetched_articles = fetch_news(search_query)
    
    #print articles to verify they are relevant
    print_articles(fetched_articles)
    print(f"Total articles fetched: {len(fetched_articles)}")
    print("---\n\n")

    # Verify articles are relevant to query and return article text
    articles_texts,score = verify_article(fetched_articles,search_query)

    # Send GPT article texts to summarize once verified all info is relevant
    summary = gptSummarize(articles_texts, search_query)
    print(summary)

    # Perform sentiment analysis on the summary
    sentiment = sentiment_analysis(summary)
    print(f"Sentiment analysis of summary: {sentiment_analysis(summary)['compound']}")
    print(f"Sentiment analysis of articles: {score}")



main()
