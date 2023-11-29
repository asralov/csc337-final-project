from Topics import SearchTopic
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s:%(levelname)s:%(message)s')
start_time = datetime.now()

# Testing Usage Search Topic
def test_stories():
    stories = SearchTopic(topic="israel hamas conflict",similarity_threshold=0.7)
    summarizes=stories.export_GPT_summaries()
    print(summarizes)
    #send_stories_to_db(econ_summarizes)

def get_keywords(file="backend/py/keyword.txt"):
    with open(file, "r") as f:
        keywords = f.read().splitlines()
    return keywords


def send_stories_to_db(stories,keyword):
    all_stories = [] 

    for story in stories:
        try:
            title = story["GPT_response"]["title"]
            background = story["GPT_response"]["background"]
            summary = story["GPT_response"]["summary"]
            urls = list(story["urls"])
            topics = list(story["GPT_response"]["topics"])
            
            data = {
                "title": title, 
                "content": {"background": background, "summary": summary},
                "urls": urls,
                "topics": topics
            }

            all_stories.append(data)  # Add the story to the list
        except Exception as e:
            print(f"Error sending story to JSON: {e}")
            logging.error(story)
    with open(f'Articles/{keyword}.json', 'w') as outfile:
        json.dump(all_stories, outfile)


def main():
    logging.info("Script started")
    keywords=get_keywords()
    for keyword in keywords:
        stories = SearchTopic(topic=keyword,similarity_threshold=0.7)
        summarizes=stories.export_GPT_summaries()
        send_stories_to_db(summarizes,keyword)
    end_time = datetime.now()
    logging.info("Script finished")
    logging.info(f"Total runtime: {end_time - start_time}")

if __name__ == "__main__" :
    main()
