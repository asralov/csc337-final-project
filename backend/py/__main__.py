# Author: Ryder Rhoads
# File: __main__.py
# Description: This script automates the process of fetching and summarizing news articles. It reads 
# keywords from a text file, searches for articles related to these topics, summarizes them using GPT, 
# and then sends the summaries to a database. This script integrates various components like custom 
# search logic, GPT-based summarization, and database interaction.


from topics import SearchTopic
import logging
import requests
from datetime import datetime

# Set up logging to track the script's operation and any issues encountered
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s:%(levelname)s:%(message)s",
)
start_time = datetime.now()
# List of general topics to filter by
topic_list = ["business", "entertainment", "health", "politics", "science", "sports", "technology"]


# Testing Usage Search Topic
def test_stories():
    stories = SearchTopic(topics=["israel hamas conflict"], similarity_threshold=0.7)
    summarizes = stories.export_GPT_summaries()
    send_stories_to_db(summarizes)

# Function to read keywords from a file, used to guide the article search
def get_keywords(file="backend/py/keyword.txt"):
    with open(file, "r") as f:
        keywords = f.read().splitlines()
    return keywords

# Function to send summarized stories to the database
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
                "content": {
                    "background": background, 
                    "summary": summary, 
                    "bias": bias
                },
                "urls": urls,
                "topics": topics,
                "imageURL": imageURL,
                "imageSource": imageSource
            }
            print("Sending data to the server:", data)
            headers = {
                'Authorization': 'Bearer Python_Script_Secret_Key'
            }
            response = requests.post("https://losethebias.com/posts/add", json=data, headers=headers)  # Add the story to the db
            print("URL:", response.url)
            print("Status Code:", response.status_code)
            print("Response Text:", response.text)

        except Exception as e:
            print(f"Error sending story to JSON: {e}")
            logging.error(story)

# Main function that orchestrates the reading of keywords, fetching and summarizing articles, and sending them to the database
def main():
    logging.info("Script started")
    keywords=get_keywords()
    stories = SearchTopic(topic=keywords,similarity_threshold=0.7)
    summarizes=stories.export_GPT_summaries()
    send_stories_to_db(summarizes)
    end_time = datetime.now()
    logging.info("Script finished")
    logging.info(f"Total runtime: {end_time - start_time}")

if __name__ == "__main__":
    main()
