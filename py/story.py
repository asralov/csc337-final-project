import os
import openai
from newspaper import Article
from newspaper import Config
from summarizer import Summarizer
from newsapi import NewsApiClient
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import AgglomerativeClustering
from sklearn.metrics.pairwise import cosine_similarity

# Initialize constants and download lexicon
NEWS_API_KEY = '68f1fe38b98f42e381f7e4b8ce258c9d'
SID = SentimentIntensityAnalyzer()

class Node:
    def __init__(self, article):
        self.article = article
        self.left = None
        self.right = None

class Story:
    def __init__(self, search_term):
        """Take a search term and generate a story from it
        Arguments:
            search_term {str} -- The term to search for
        Use: Find stories for specfic topics and summarize them
        """
        self._term=search_term
        self._links= self.get_links() #list of tuples (title, url)
        self._articles,self._sentiment=self.clean_articles() #list of articles, sentiment score
        self._summary=self.summarize()
        self._title = self.generate_title([title for title, url in self._links])

    def get_links(self):
        newsapi = NewsApiClient(api_key=NEWS_KEY)
        articles = newsapi.get_everything(q=self._term,
                                            language='en',
                                            sort_by='relevancy',
                                            page_size=20)
        return [(article['title'], article['url']) for article in articles['articles']]
    
    def print_stories(self):
        num=0
        for title,url in self._links:
            print(f"{num} : {title} | {url} ")
            num+=1

    def clean_articles(self):
        texts = []
        articles=[]
        score = 0
        goal = self._links[0][0]  # goal story title

        vectorizer = TfidfVectorizer()
        goal_vector = vectorizer.fit_transform([goal])

        for i, (title, url) in enumerate(self._links):
            config = Config()
            config.browser_user_agent = 'Mozilla/5.0...'
            article = Article(url, config=config)
            article.download()
            article.parse()
            text = article.text
            text_vector = vectorizer.transform([text])
            similarity = cosine_similarity(goal_vector, text_vector)[0][0]

            if similarity > 0.5:  # adjust this threshold as needed
                score += SID.polarity_scores(text)["compound"]
                articles.append((title, url))
                texts.append(text)
        self._links=articles
        return texts, score

    def create_clusters(self):
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform(self._articles)
        similarity_matrix = cosine_similarity(tfidf_matrix)
        self.clustering = AgglomerativeClustering(
            affinity='precomputed',
            linkage='average',
            distance_threshold=0,
            n_clusters=None
        ).fit(1 - similarity_matrix)  # 1 - similarity_matrix to convert similarity to distance

    def summarize_clusters(self):
        n_clusters = self.clustering.n_clusters_
        labels = self.clustering.labels_
        cluster_summaries = []
        model = Summarizer()
        for i in range(n_clusters):
            cluster_articles = [article for j, article in enumerate(self._articles) if labels[j] == i]
            cluster_text ="\n-----\n".join(cluster_articles)
            cluster_summary = model(cluster_text)
            cluster_summaries.append(cluster_summary)
        
        return cluster_summaries

    def summarize(self):
        self.create_clusters()
        cluster_summaries = self.summarize_clusters()
        final_text = "\n-----\n".join(cluster_summaries)
        model = Summarizer()
        self._summary = model(final_text)

    def summary(self):
        response = openai.Completion.create(
            engine="davinci",
            prompt=f"Summarize the following to highlight 3 main points and why it is important in the most unbias way possible \n----\n{self._summary}",
            max_tokens=500,
            n=1,
            #temperature=0.2,
            #top_p=0.,
            #frequency_penalty=0.0,
            #presence_penalty=0.0
        )
        return response ['choices'][0]['text'].strip()
    
    def generate_title(self, titles):
        openai.api_key = os.getenv('OPENAI_API_KEY')
        if openai.api_key is None:
            raise ValueError("Missing OpenAI API Key. Set it as an environment variable named 'OPENAI_API_KEY'")

        # Concatenate all titles into a single string
        titles_text = " ".join(titles)
        
        # Construct a prompt for GPT-3
        prompt = f"Create a non-bias title based on the following titles in under 75 words: {titles_text}"
        
        response = openai.Completion.create(
            engine="davinci",
            prompt=prompt,
            max_tokens=100,
            n=1,
            #temperature=0.2,
            #top_p=0.2,
            #frequency_penalty=0.0,
            #presence_penalty=0.0
        )
        
        generated_title = response['choices'][0]['text'].strip()
        return generated_title
    
    def title(self):
        return self._title
    
    def sentiment(self):
        return self._sentiment