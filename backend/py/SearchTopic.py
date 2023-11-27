import os
import openai
import re
from newspaper import Article
from newspaper import Config
from nltk.sentiment import SentimentIntensityAnalyzer
from newsapi import NewsApiClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import transformers
tokenizer = transformers.AutoTokenizer.from_pretrained("openai-gpt")



# Initalize API keys and other variables
news_api_key = os.environ.get("NEWSAPI_KEY")
openai_api_key = os.environ.get("OPENAI_API_KEY")
SID = SentimentIntensityAnalyzer()


class SearchTopic:
    def __init__(self, topic):
        # save topic term and get articles
        self._term = topic
        self._articles = self.get_articles()

    def get_articles(self, num_loop=1):
        """Function to download articles sorted by time from the newsAPI on a given topic"""
        articles = []
        titles = []
        newsapi = NewsApiClient(api_key=news_api_key)
        # loop set so we can add more articles if needed
        for i in range(num_loop):
            api_response = newsapi.get_everything(
                q=self._term,
                language="en",
                sort_by="publishedAt",
                page_size=100,  # max is 100 allowed by API
            )

            for article in api_response["articles"]:
                # Checks for duplicate articles and if they have a summary
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

        # Download article text and calculate sentiment
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
        """Function to preprocess text for TF-IDF"""
        text = text.lower()
        pattern = r"[^\w\s]"
        preprocessed_text = re.sub(pattern, "", text)
        return preprocessed_text

    def calculate_similarity(self):
        """Convert articles to TF-IDF"""
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(
            [self.preprocess_text(article["text"]) for article in self._articles]
        )
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        return cosine_sim

    def find_article_groups(self, threshold=0.5):
        """Function to find groups of similar articles"""
        similarity_scores = self.calculate_similarity()
        num_articles = len(similarity_scores)
        article_groups = {}
        group_id = 0
        grouped_articles = set()

        for i in range(num_articles):
            # Skip article if it's already grouped
            if i in grouped_articles:
                continue

            # Store articles similar to the current one
            similar_articles = [i]

            # Compare the current article with every other article
            for j in range(num_articles):
                # If the similarity score exceeds the threshold and is not the same article, add it to the similar articles list
                if i != j and similarity_scores[i][j] > threshold:
                    similar_articles.append(j)
                    grouped_articles.add(j)

            if len(similar_articles) > 1:
                article_groups[group_id] = similar_articles
                group_id += 1

        return article_groups

    def create_prompt(self, articles):
        """Function to create prompt for GPT-4"""
        prompt = f'Below are summaries of articles related to {self._term}. Please provide a short summary for all of them that includes a general title listed as "Title:", then "Background:" which is a background of the topic, followed by the summary of the articles listed as "Summary:". Again, I only need 1 summary, background, and title for all of the articles. It should be short and like a debrief for the president. If there are any articles which don\'t seem to align with the general idea / topic please ignore them. \n\n'
        for article in articles:
            json_article = self._articles[article]
            prompt += f"\n\nTitle: {json_article['title']}\n"
            prompt += f"Text: {json_article['text']}\n"
        
        print(len(tokenizer(prompt)))
        return prompt

    def export_GPT_summaries(self):
        """Function to export GPT-3 summaries to text files, along with the summaries from the articles"""
        article_groups = self.find_article_groups(threshold=0.6)
        for group_id, article_indices in article_groups.items():
            prompt = self.create_prompt(article_indices)
            summary = self.generate_summary(prompt)
            file_name = f"Articles/group_{group_id}.txt"
            print(f"Writing summary to {file_name}")
            with open(file_name, "w", encoding="utf-8") as file:
                file.write(summary)
                file.write("\n\n Summary Pulled from the following articles:")
                file.write("-" * 80 + "\n\n")
                for article_index in article_indices:
                    article = self._articles[article_index]
                    file.write(f"Article Title: {article['title']}\n")
                    file.write(f"URL: {article['url']}\n")

    def generate_summary(self, prompt):
        """Function to generate summaries using GPT-3.5-turbo-16k"""
        openai.api_key = openai_api_key
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo-16k",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt},
                ],
            )
            if response.get("choices"):
                return (
                    response["choices"][0]
                    .get("message", {"content": ""})["content"]
                    .strip()
                )
            else:
                print("No content in response choices.")
                return ""

        except Exception as e:
            print(f"Error generating summary: {e}")
            return ""


# Testing Usage
econ = SearchTopic(topic="economics")
econ.export_GPT_summaries()
