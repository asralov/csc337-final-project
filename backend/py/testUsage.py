from SearchTopic import SearchTopic
from TrendingTopic import TrendingTopic

# Testing Usage Search Topic
econ = SearchTopic(topic="Economics")
musk = SearchTopic(topic="Elon Musk")
econ.export_GPT_summaries()
musk.export_GPT_summaries()

# Testing Usage Top Topics
hamas = TrendingTopic(country="us",catagory="general",topic="Hamas")
AAPL = TrendingTopic(country="us",catagory="general",topic="AAPL")

hamas.export_GPT_summaries()
AAPL.export_GPT_summaries()