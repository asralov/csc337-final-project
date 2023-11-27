from SearchTopic import SearchTopic
import requests

# Testing Usage Search Topic
def test_stories():
    stories = SearchTopic(topic="israel hamas conflict",similarity_threshold=0.7)
    summarizes=stories.export_GPT_summaries()
    print(summarizes)
    #send_stories_to_db(econ_summarizes)

def send_stories_to_db(stories):
    for story in stories:
        title=story["GPT_response"]["title"]
        background=story["GPT_response"]["background"]
        summary=story["GPT_response"]["summary"]
        urls=list(story["urls"])
        topics=list(story["GPT_response"]["topics"])
        
        #Orgainize json
        json={"title":title, 
            "content":{background:background,summary:summary},
            "urls":urls,
            "topics":topics}
        requests.post("/post/add", json=json)

test_stories()