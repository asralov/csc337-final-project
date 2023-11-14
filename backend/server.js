const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Database connection
const mongoDBURL = "mongodb://127.0.0.1:27017/";
const mongoDBName = "sentiment";
const mongoDBOptions = {
    retryWrites: true,
    w: 'majority',
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose.connect(`${mongoDBURL}${mongoDBName}`, mongoDBOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a schema for news stories
var StorySchema = new mongoose.Schema({
    collectedAt: Number,
    summaryQuery: String,
    pos: Number,
    neu: Number,
    neg: Number,
    compound: Number,
    type: String,
    urls: Array,
});
var NewsStory = mongoose.model('NewsStory', StorySchema);

app.use(express.static('public_html'));
app.use(express.json());

// Route to handle requests to post a new story
app.post('/api/sentiment', async function (req, res) {
    var collectedAt = Date.now();
    var summaryQuery = req.body.summaryQuery;
    var pos = req.body.pos;
    var neg = req.body.neg;
    var neu = req.body.neu;
    var compound = req.body.compound;
    var newsType = req.body.type;
    var urls = req.body.urls;
    
    var newsStory = new NewsStory({
        collectedAt: collectedAt,
        summaryQuery: summaryQuery,
        pos: pos,
        neg: neg,
        neu: neu,
        compound: compound,
        type: newsType,
        urls: urls,
    });

    try {
        await newsStory.save();
        res.status(200).send("Story saved successfully.");
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

function calculateOldestStory(beginning) {
    const now = new Date();
    switch (beginning) {
        case "day":
            now.setDate(now.getDate() - 1); // Subtract 1 day
            break;
        case "week":
            now.setDate(now.getDate() - 7); // Subtract 7 days
            break;
        case "month":
            now.setMonth(now.getMonth() - 1); // Subtract 1 month
            break;
        case "year":
            now.setFullYear(now.getFullYear() - 1); // Subtract 1 year
            break;
        default:
            throw new Error("Invalid time period specified");
    }
    return now.getTime(); // Return the time in milliseconds since the Unix Epoch
}

// Route to handle requests to get stories from the database
app.get('/api/stories/', async function (req, res) {
    var type = req.query.type || "all"; // Type of news 
    var beginning = req.query.time || "week"; // Time of news
    var oldestStory;

    try {
        oldestStory = calculateOldestStory(beginning);
    } catch (error) {
        console.error(error);
        return res.status(400).send(error.message); // Bad request for invalid 'beginning' value
    }

    try {
        const stories = await NewsStory.find({
            collectedAt: { $gt: oldestStory },
            ...(type !== "all" && { type: type })
        }).sort({ "collectedAt": -1 });
        var result = '';
        for (const story of stories) {
            result += "Passed\n"; 
        }
        res.send(result);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Route to handle requests to delete all stories from the database
app.delete('/api/stories/clear', async function (req, res) {
    try {
        // Use the deleteMany method to delete all documents in the collection
        const result = await NewsStory.deleteMany({});
        res.status(200).send(`Deleted ${result.deletedCount} stories.`);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Start the server
app.listen(port, (err) => {
    if (err) {
        console.error(`Error starting the server: ${err}`);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
