require('dotenv').config()

const sseExpress = require('sse-express');

const EpisodeGenerator = require("./episode-generator");
const generator = new EpisodeGenerator();

const { formatShortPrompt } = require("./prompt");

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static('public'))

const userSet = new Set();
const userPrompMap = new Map();
var promptCount = 1;

const fs = require("fs");
const dbFile = "./.data/scores.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

/**
 * Database functions
 */

db.serialize(() => {
  if (!exists) {
    db.run(
      "CREATE TABLE Scores (user TEXT PRIMARY KEY, score INT DEFAULT 0)"
    );
    console.log("New table Scores created!");
  } else {
    console.log('Database "Scores" ready to go!');
    // db.each("SELECT * from Scores ORDER BY score DESC LIMIT 25", (err, row) => {
    //   if (row) {
    //     console.log(`${row.user} ${row.score}`);
    //   }
    // });
  }
});

/**
 * Upsert the score for the given user.
 * 
 * https://www.sqlite.org/draft/lang_UPSERT.html
 * 
 * @param {string} user 
 * @param {number} score 
 */
function updateUserScore(user, score) {
  db.run('INSERT INTO Scores (user, score) VALUES (?,?) ON CONFLICT(user) DO UPDATE SET score=excluded.score', 
    user, score, 
    error => {
      if (error) {
        console.error(`Error updating score for ${user}: ${error}`);
      } else {
        console.log(`Success!  Updated score for ${user} to ${score}`);
      }
    }
  );
}

/**
 * Get the score for given user.
 * 
 * @param {string} user 
 * @param {Function} callback handler that receives the user's score or 0 if score not found
 */
function getUserScore(user, callback) {
  db.all(`SELECT score from Scores WHERE user='${user}' LIMIT 1`, (err, rows) => {
    var score = 0;
    if (err) {
      console.error(`Error getting score for ${user}: ${error}`);
    } else if (rows && rows.length > 0) {
      console.log(`Score for ${user}: ${rows[0].score}`);
      score = rows[0].score;
    }
    if (callback) callback(score);
  });
}

/**
 * Endpoints
 */

app.get("/addPrompt", (req, res) => {
  console.log(`addPrompt:headers = ${JSON.stringify(req.headers)}`);

  const user = req.headers['x-twitch-user'];
  const prompt = decodeURIComponent(req.headers['x-prompt'])
    .replace(/\+/g, ' ')
    .substring(0, 500); // fix for unlimited length prompts on Twitch mobile

  if (user != "aipd" && userSet.has(user)) {
    console.warn(`Error: ${user} already has a prompt pending.`);
    res.status(200).send("ERROR_USER_PROMPT_PENDING");
    return;
  }

  userSet.add(user);
  console.log(`${user} submitted prompt = ${prompt}`);

  const formattedPrompt = formatShortPrompt(prompt);
  const userPrompt = {
    user,
    date: new Date(Date.now()).toISOString(),
    prompt: formattedPrompt
  };

  userPrompMap.set(user, userPrompt);
  res.status(200).send(`${userSet.size}`);
});

app.post("/addPromptManual", (req, res) => {
  const user = req.body.user;
  const prompt = req.body.prompt;
  const location = req.body.location;
  const model = req.body.model;
  const skiptts = req.body.skiptts;
  const generatecount = req.body.generatecount;
  const generatetokenamount = req.body.generatetokenamount;

  const userPrompt = {
    user,
    date: new Date(Date.now()).toISOString(),
    prompt,
    location,
    model,
    options: {
      skiptts,
      generateCount: generatecount,
      generateTokenAmount: generatetokenamount,
    }
  };

  if (user == "aipd") {
    console.log(`ADMIN ${user} submitted prompt = ${prompt}`);
    generator.addPrompt(userPrompt);
    promptCount++;
  } else {
    if (userSet.has(user)) {
      console.warn(`Error: ${user} already has a prompt pending.`);
      res.status(200).send("ERROR_USER_PROMPT_PENDING");
      return;
    }
    console.log(`${user} submitted prompt = ${prompt}`);
    userSet.add(user);
    userPrompMap.set(user, userPrompt);
  }

  res.status(200).send(`${userSet.size}`);
});

app.post("/continue", (req, res) => {
  const user = req.body.user;
  const prompt = req.body.prompt;
  const location = req.body.location;
  const model = req.body.model;
  const skiptts = req.body.skiptts;

  generator.markContinue();
  generator.addPrompt({
    user,
    date: new Date(Date.now()).toISOString(),
    prompt,
    location,
    model,
    options: {
      skiptts,
    }
  });

  res.status(200).send({message: "Success! The current story will continue"});
  promptCount++;
});

app.post("/markPlayed", (req, res) => {
  const user = req.query.user;
  console.log(`${user} episode marked as played.`);
  userSet.delete(user);
  res.status(200).send({});
});

app.post("/addStory", (req, res) => {
  const rawStory = req.body;
  rawStory.location = "";
  // rawStory.ai_img_background = "";
  console.log(`${rawStory.user}'s story manually approved and added to processing queue.`);
  // console.log(rawStory);
  generator.addRawEpisode(rawStory);
  res.status(200).send({});
});

app.get("/queue", (req, res) => {
  // const user = req.query.user;
  res.status(200).send(JSON.stringify([...userSet]));
});

app.get("/getUserScore", (req, res) => {
  console.log(`getUserScore:headers = ${JSON.stringify(req.headers)}`);
  const user = req.headers['x-twitch-user'].trim().toLowerCase();
  getUserScore(user, (currentScore) => {
    res.status(200).send(`${currentScore}`);
  });
});

app.get("/saveUserScore", (req, res) => {
  console.log(`saveUserScore:headers = ${JSON.stringify(req.headers)}`);
  const user = req.headers['x-twitch-user'].trim().toLowerCase();
  const newScore = parseInt(req.headers['x-score']);
  getUserScore(user, (currentScore) => {
    updateUserScore(user, currentScore + newScore);
  });
  res.status(200).send({});
});

// const AB_TOKEN = process.env.AB_TOKEN;
app.get("/moderation/events", sseExpress(), (request, response) => {
  // if (!request.query.token || request.query.token !== AB_TOKEN) {
  //   response.status(403).send({ error: 'Forbidden' });
  //   return;
  // }
  
  console.log("aitv> event source client opened");

  const intervalId = setInterval(() => {
    const eventData = {
      prompts: Object.fromEntries(userPrompMap)
    };
    
    response.sse({
      event: 'heartbeat',
      data: eventData
    });
  }, 200);
  
  response.on('close', () => {
    console.log("aitv> event source client closed");
    clearInterval(intervalId);
  });
});

app.get("/moderation/approve", (req, res) => {
  const user = req.query.user;
  const shouldContinue = req.query.continue ? req.query.continue === "true" : false;
  const userPrompt = userPrompMap.get(user);
  userPrompt.date = new Date(Date.now()).toISOString(); // refresh date to when it was approved

  consolere.re.log(`moderation:approve> ${JSON.stringify(userPrompt)} Continue? ${shouldContinue}`);

  if (shouldContinue) generator.markContinue();
  const success = generator.addPrompt(userPrompt);
  if (success) {
    userPrompMap.delete(user);
    promptCount++;
  } else {
    console.warn(`moderation:approve> ${user} has pending prompt`)
  }
  res.status(200).send({});
});

app.get("/moderation/deny", (req, res) => {
  const user = req.query.user;
  const userPrompt = userPrompMap.get(user);

  consolere.re.log(`moderation:deny> ${JSON.stringify(userPrompt)}`);
  userPrompMap.delete(user);
  userSet.delete(user);

  // TODO add streamer.bot action to alert user their prompt has been denied
  // https://wiki.streamer.bot/en/Servers-Clients/HTTP-Server

  res.status(200).send({});
});

/**
 * Launcher
 */

function start() {
  generator.start();
  const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
}

start();
