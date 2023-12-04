from Topics import SearchTopic
import json
import logging
import requests
from datetime import datetime

# Set up logging
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s:%(levelname)s:%(message)s",
)
start_time = datetime.now()
topic_list = ["business", "entertainment", "health", "politics", "science", "sports", "technology"]


# Testing Usage Search Topic
def test_stories():
    stories = SearchTopic(topics=["israel hamas conflict"], similarity_threshold=0.7)
    summarizes = stories.export_GPT_summaries()
    send_stories_to_db(summarizes, "Israel")


def get_keywords(file="backend/py/keyword.txt"):
    with open(file, "r") as f:
        keywords = f.read().splitlines()
    return keywords


def send_stories_to_db(stories):
    for story in stories:
        try:
            title = story["GPT_response"]["title"]
            background = story["GPT_response"]["background"]
            summary = story["GPT_response"]["summary"]
            bias = story["GPT_response"]["bias"]
            urls = list(story["urls"])
            topics = list(story["GPT_response"]["topics"])
            imageURL = story["imageURL"]
            imageSource = story["imageSource"]

            for topic in topics:
                if topic not in topic_list:
                    topics.remove(topic)

            data = {
                "title": title,
                "content": {"background": background, "summary": summary, "bias": bias},
                "urls": urls,
                "topics": topics,
                "imageURL": imageURL,
                "imageSource": imageSource
            }
            data=json.dumps(data)
            print(data)
            #requests.post("http://losethebias.com/post/add",json=data)  # Add the story to the db
        except Exception as e:
            print(f"Error sending story to JSON: {e}")
            logging.error(story)


# def main():
#    logging.info("Script started")
#    keywords=get_keywords()
#    for keyword in keywords:
#        stories = SearchTopic(topic=keyword,similarity_threshold=0.7)
#        summarizes=stories.export_GPT_summaries()
#        send_stories_to_db(summarizes,keyword)
#    end_time = datetime.now()
#    logging.info("Script finished")
#    logging.info(f"Total runtime: {end_time - start_time}")

if __name__ == "__main__":
    test_stories()
