import os
import openai
import re
from newspaper import Article
from newspaper import Config
from nltk.sentiment import SentimentIntensityAnalyzer
from newsapi import NewsApiClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initalize API keys and other variables
news_api_key = os.environ.get("NEWSAPI_KEY")
openai_api_key = os.environ.get("OPENAI_API_KEY")
SID = SentimentIntensityAnalyzer()


class TrendingTopic:
    def __init__(self, topic):
        self._term = topic
        self._articles = self.get_articles()

    def get_articles(self):
        articles = []
        titles = []
        newsapi = NewsApiClient(api_key=news_api_key)
        # loop set so we can add more articles if needed
        for i in range(1):
            # TODO: add get top headlines API request

            for article in api_response["articles"]:
                if article["title"] not in titles and article["description"]:
                    articles.append(
                        {
                            "title": article["title"],
                            "url": article["url"],
                            "description": article["description"],
                            "sentiment": 0,
                            "text": "",
                        }
                    )
                    titles.append(article["title"])

        for article_dict in articles:
            config = Config()
            config.browser_user_agent = "Mozilla/5.0..."
            article = Article(article_dict["url"], config=config)
            try:
                article.download()
                article.parse()
                article_dict["text"] = article.text
                sentiment_scores = SID.polarity_scores(article.text)
                article_dict["sentiment"] = sentiment_scores["compound"]
            except Exception as e:
                print(f"Error downloading article: {e}")
        return articles

    def preprocess_text(self, text):
        text = text.lower()
        pattern = r"[^\w\s]"
        preprocessed_text = re.sub(pattern, "", text)
        return preprocessed_text

    def calculate_similarity(self):
        # Convert articles to TF-IDF
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(
            [self.preprocess_text(article["text"]) for article in self._articles]
        )
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        return cosine_sim

    def find_article_groups(self, threshold=0.5):
        similarity_scores = self.calculate_similarity()
        num_articles = len(similarity_scores)
        article_groups = {}
        group_id = 0
        grouped_articles = set()

        for i in range(num_articles):
            if i in grouped_articles:
                continue
            similar_articles = [i]
            for j in range(num_articles):
                if i != j and similarity_scores[i][j] > threshold:
                    similar_articles.append(j)
                    grouped_articles.add(j)

            if len(similar_articles) > 1:
                article_groups[group_id] = similar_articles
                group_id += 1

        return article_groups

    def create_prompt(self, articles):
        prompt = f"Below are summaries of articles related to {self._term}. Please provide an short summary that provides all the important information from these articles"
        for article in articles:
            json_article = self._articles[article]
            prompt += f"\n\nTitle: {json_article['title']}\n"
            prompt += f"URL: {json_article['url']}\n"
            prompt += f"Summary: {json_article['description']}\n"
        return prompt

    def export_GPT_summaries(self):
        article_groups = self.find_article_groups(threshold=0.5)
        for group_id, article_indices in article_groups.items():
            prompt = self.create_prompt(article_indices)
            summary = self.generate_summary(prompt)
            file_name = f"group_{group_id}.txt"
            with open(file_name, "w", encoding="utf-8") as file:
                file.write(summary)
                file.write("\n\n Summary Pulled from the following articles:")
                file.write("-" * 80 + "\n\n")
                for article_index in article_indices:
                    article = self._articles[article_index]
                    file.write(f"Article Title: {article['title']}\n")
                    file.write(f"URL: {article['url']}\n")
                    file.write(f"Article Text:\n{article['text']}\n")

    def generate_summary(self, prompt):
        openai.api_key = openai_api_key
        response = openai.Completion.create(
            engine="davinci",
            prompt=prompt,
            temperature=0.3,
            max_tokens=300,
            top_p=1,
            frequency_penalty=0.5,
            presence_penalty=0.5,
            stop=["\n", "Title:", "URL:", "Summary:"],
        )
        return response["choices"][0]["text"]


# Usage
econ = TrendingTopic(topic="economics")

econ.export_GPT_summaries()
