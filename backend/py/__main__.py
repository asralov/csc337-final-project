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

discord_hook = "https://discord.com/api/webhooks/1181768646901641277/WX2r5wjdoz1eSnpRs935GcNUKhdjec1LbYjzxz7_iyw-sBo1ktqRaVACVW_-jho7C1_e"

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

def send_to_discord(log_content,hook_url=discord_hook):
    data = {
        'content': f"{log_content}"
    }
    requests.post(hook_url, json=data)
    logging.info(f"Sent to Discord: {log_content}")

# Function to send summarized stories to the database
def send_stories_to_db(stories):
    send_to_discord(f"Sending {len(stories)} stories to the database")
    count = 0
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

            topics = [topic for topic in topics if topic.lower() in topic_list]  # Filter out topics that aren't in the list

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
            if response.status_code == 201:
                count+=1
                send_to_discord(f"Successfully sent story to the database: {title}")
        except Exception as e:
            print(f"Error sending story to JSON: {e}")
            logging.error(story)
        send_to_discord(f"Successfully sent {count} stories to the database")

# Main function that orchestrates the reading of keywords, fetching and summarizing articles, and sending them to the database
def main():
    logging.info("Script started")
    keywords=get_keywords()
    stories = SearchTopic(topics=keywords,similarity_threshold=0.7)
    summarizes=stories.export_GPT_summaries()
    send_stories_to_db(summarizes)
    end_time = datetime.now()
    logging.info("Script finished")
    send_to_discord(f"Script finished. Total runtime: {end_time - start_time}")
    logging.info(f"Total runtime: {end_time - start_time}")

if __name__ == "__main__":
    main()
