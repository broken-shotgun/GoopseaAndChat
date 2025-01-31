const fs = require("fs");
const { chunkify, getRandomInt, shuffle } = require("./utils");
// const { censor } = require("./censor");
const GCTTS = require("./google-tts-client");
const KoboldAIClient = require("./kobold-client");
const OpenAIClient = require("./openai-client");

module.exports = class EpisodeGenerator {
  constructor() {
    this.tts = new GCTTS();
    this.koboldai = new KoboldAIClient();
    this.openai = new OpenAIClient();
    this.running = false;
    this.continue = false;
    this.continueCount = 0;
    this.currentMessages = [];
    this.userPromptQueue = [];
    this.rawEpisodeQueue = [];
    this.episodeNumber = 1;
    this.chatLogDivider = ">>";
    this.lineRegex = new RegExp(`^([^\n\r${this.chatLogDivider}]*)${this.chatLogDivider} (.+)$`, "i");
    this.prevModifierIndex = -1
    this.setupPrompt = `You are generating a script between the following characters: Goopsea, Jack, and Woadie. Goopsea is a humorous overweight cat, Woadie is a blissfully ignorant frog dog, and Jack is their awkward goofball owner.  Every line should be formatted like this: Name ${this.chatLogDivider} dialoge.  If the line is anything other than dialog, please start with ${this.chatLogDivider}. Here is an example: Goopsea ${this.chatLogDivider} Hi.\n${this.chatLogDivider} A loud rumble occurs and then Jack falls out of the ceiling.\nJack ${this.chatLogDivider} Hello.`;
    // https://en.wikipedia.org/wiki/The_Thirty-Six_Dramatic_Situations
    this.modifiers = shuffle([
      "Continue the script and focus on the initial topic.",
      "Continue the script and make the characters experience or achieve something amazing.",
      "Continue the script and make the characters experience a downfall and have an unhappy ending.",
      "Continue the script and have one of the characters fail.",
      "Continue the script make it a comedy.",
      "Continue the script and make it a tragedy.",
      "Continue the script and make it have a sad ending.",
      "Continue the script and make it have a happy ending.",
      // "Continue the script and introduce a celebrirty or famous character from a work of fiction.",
      // "Continue the script and make all the characters breakout into a WWE style wrestling match.",
      // "Continue the script and give one of the characters a supernatural power.",
      // "Continue the script and introduce an apocalyptic event.",
      // "Continue the script and make it into a heroes story.",
      "Continue the script and make one of the characters gain something new",
      "Continue the script and introduce a conflict.",
      // "Continue the script and make one of the characters master a new thing.",
      "Continue the script and make one of the characters fall victim to madness.",
      "Continue the script and make one of the characters get revenge",
      // "Continue the script and introduce a sudden disaster.",
      // "Continue the script and make one of the characters start a new enterprise based off the script so far.",
      // "Continue the script and make one of the characters self-sacrifice for an ideal.",
      // "Continue the script and make one of the characters self-sacrifice for kin.",
      // "Continue the script and make one of the characters self-sacrifice for passion.",
      "Continue the script and make one of the characters face off against a rival.",
      // "Continue the script and make one of the characters have a conflict with a god.",
      "Continue the script and make one of the characters deal with remorse.",
      "Continue the script and make one of the characters overcome a monster.",
      // "Continue the script and make one of the characters go on a quest.",
      "Continue the script and make one of the characters change their ways and become a better individual.",
      // "Continue the script and make one of the characters go on a voyage.",
      // "Continue the script and have the characters experience a natural disaster.",
      // "Continue the script and have the characters experience an unnatural disaster."
    ]);
  }

  /**
   * @typedef {Object} UserPrompt
   * @property {string} user Twitch username who submitted this prompt
   * @property {string} date timestamp for when reward was redeemed
   * @property {string} prompt formatted episode prompt
   */

  /**
   * Add user submitted prompt to queue.
   * @param {UserPrompt} userPrompt object with user, date, and prompt
   * @returns true if prompt added, false if user already has a pending prompt
   */
  addPrompt(userPrompt) {
    if (this.userPromptQueue.find(p => p.user === userPrompt.user)) {
      return false;
    }
    this.userPromptQueue.push(userPrompt);
    return true;
  }

  /**
   * Manually adds story to processing queue (bypasses moderation).
   * @param {RawEpisode} rawEpisode 
   */
  addRawEpisode(rawEpisode) {
    const updatedEpisodeName = `episode-${rawEpisode.date}-${this.episodeNumber.toString().padStart(3, '0')}-${rawEpisode.model}-${rawEpisode.user}`;
    this.episodeNumber += 1;
    rawEpisode.name = updatedEpisodeName;
    this.rawEpisodeQueue.push(rawEpisode);
  }

  /**
   * Save the raw text version of the story to local folder.
   * @param {string} storyName filename
   * @param {string} rawTxtStory raw formatted story
   * @param {Function} callback called when writeFile is completed
   */
  saveStoryTextLocal(storyName, rawTxtStory, callback = () => {}) {
    console.re.log("saving current story...");
    fs.writeFile(`episodes/raw/${storyName}.txt`, rawTxtStory, "utf-8", (err) => {
      if (err) console.re.error(err);
      else console.re.log(`Success!  Story saved to: episodes/raw/${storyName}.txt`);
      if (callback) callback();
    });
  }

  start() {
    this.running = true;
    
    this.runOpenAIGeneratorV2();
    this.runProcessor();

    // Goops & Gobs
    // this.runGoopsAndGoblinsOpenAIGenerator();
    // this.runGoopsAndGoblinsProcessor();
  }

  stop() {
    this.running = false;
  }

  /**
   * Run more interactive AI generation loop using OpenAI to generate responses.
   * 
   * Keep an eye on usage as each request costs $$$:
   * https://platform.openai.com/account/usage
   * 
   */
  async runOpenAIGeneratorV2() {
    if (!this.running) return;
    if (this.userPromptQueue.length < 1) {
      setTimeout(this.runOpenAIGeneratorV2.bind(this), 100);
      return;
    }

    var currentUserPrompt = this.userPromptQueue.shift();
    const currentLocation = this.getRandomLocation();
    try {
      const messages = [];
      if (this.continue) { // continue previous episode
        this.continueCount++;
        messages.push(...this.currentMessages); // add all messages from previous episode(s)
        messages.push({role: "user", content: currentUserPrompt.prompt});
        console.re.log(`continuing previous episode, current episode arc = ${this.continueCount + 1} episodes`);
      }
      else { // new episode
        console.re.log(`starting new episode`);
        this.continueCount = 0;
        this.currentMessages = [];
        messages.push({role: "system", content: this.setupPrompt});
        messages.push({role: "user", content: currentUserPrompt.prompt});
      }

      // var img_b64 = null;
      // try {
      //   const imgResponse = await this.openai.generateImage(currentUserPrompt.prompt);
      //   console.re.log(`generateImage> ${imgResponse.status} ${imgResponse.statusText}`);
      //   img_b64 = (imgResponse.data) ? imgResponse.data.data[0].b64_json : null;
      // } catch (err) {
      //   console.re.warn(`generateImage> Error generating image for ${currentUserPrompt.user}`);
      //   console.re.error(err);
      // }

      var generateCount = 2;
      var modifierIndex = getRandomInt(this.modifiers.length);
      while (modifierIndex == this.prevModifierIndex) modifierIndex = getRandomInt(this.modifiers.length); // guarentee new modifier
      this.prevModifierIndex = modifierIndex;
      var prevRemainingTokens = 0;
      for(var i=0; i<generateCount; ++i) {
        if (i==1) {
          var midPrompt = this.modifiers[modifierIndex];
          console.re.log(`openai:modify> ${midPrompt.toUpperCase()}`);
          messages.push({role: "user", content: `[${midPrompt}]` });
        }

        const maxTokens = this.getMaxTokens(i, generateCount) + prevRemainingTokens;
        var response;
        try {
          console.re.log(`openai:tokens> [${i}] generating with max tokens = ${maxTokens}`);
          response = await this.openai.generateChat(messages, {max_tokens: maxTokens});
        } catch(generateErr) {
          console.re.error(generateErr);
          continue;
        }
        if (!response) {
          console.re.warn(`openai:generateChat> null generate response, skipping...`);
          continue;
        }

        console.re.log(`${response.status} ${response.statusText}: ${JSON.stringify(response.data)}`);
  
        if (response.status === 200 && 
          response.data && 
          response.data.choices.length > 0
        ){
          console.re.log(`openai:generateChat> ${response.data.choices[0].message.content}`);
          messages.push(response.data.choices[0].message);
          prevRemainingTokens = maxTokens - response.data.usage.completion_tokens;
          if (prevRemainingTokens < 0) prevRemainingTokens = 0;
          console.re.log(`openai:generateChat> LEFTOVER TOKENS = ${prevRemainingTokens}`);
        } else {
          console.re.warn(`openai:generateChat> no responses data and/or choices`);
        }
      }
  
      var rawTxtStory;
      var episodeName;
      if (this.continue) { // only process latest episode in the continue saga
        episodeName = `episode-${currentUserPrompt.date.replaceAll(":", "-")}-${this.episodeNumber.toString().padStart(3, '0')}-part-${this.continueCount + 1}-openai-${currentUserPrompt.user}`;
        rawTxtStory = currentUserPrompt.prompt + "\n" + messages.splice(this.currentMessages.length)
          .filter((msg) => msg.role === "assistant")
          .map((msg) => msg.content)
          .join("\n");
      } else {
        episodeName = `episode-${currentUserPrompt.date.replaceAll(":", "-")}-${this.episodeNumber.toString().padStart(3, '0')}-openai-${currentUserPrompt.user}`;
        rawTxtStory = currentUserPrompt.prompt + "\n" + messages
          .filter((msg) => msg.role === "assistant")
          .map((msg) => msg.content)
          .join("\n");
      }
      const aiModel = this.openai.getCurrentModel();
      await this.moderateEpisode({
        name: episodeName,
        date: currentUserPrompt.date,
        user: currentUserPrompt.user,
        model: aiModel,
        location: currentLocation,
        story: rawTxtStory,
        //ai_img_background: img_b64
      });
      

      this.episodeNumber += 1;
      this.continue = false;
      this.currentMessages = messages; // messages.splice(this.currentMessages.length); // if the cost is outrageous, only store last episode into memory
    } catch (err) {
      console.re.warn(`runOpenAIGenerator> Error generating prompt for ${currentUserPrompt.user}`);
      console.re.error(err);
    }

    setTimeout(this.runOpenAIGeneratorV2.bind(this), 100);
  }

  /**
   * Run Goops & Goblins AI generation loop using OpenAI to generate responses.
   * 
   * Keep an eye on usage as each request costs $$$:
   * https://platform.openai.com/account/usage
   * 
   */
    async runGoopsAndGoblinsOpenAIGenerator() {
      if (!this.running) return;
      if (this.userPromptQueue.length < 1) {
        setTimeout(this.runGoopsAndGoblinsOpenAIGenerator.bind(this), 100);
        return;
      }
  
      var currentUserPrompt = this.userPromptQueue.shift();
      const currentLocation = "goopsea-and-goblins";
      try {
        const currentIndex = this.currentMessages.length;
        if (this.continueCount == 0) {
          this.currentMessages = [];
          this.currentMessages.push({role: "system", content: this.setupPrompt});
          this.currentMessages.push({role: "user", content: currentUserPrompt.prompt});
        } else {
          this.currentMessages.push({role: "user", content: currentUserPrompt.prompt});
          console.re.log(`continuing previous episode, current episode arc = ${this.continueCount + 1} episodes`);
        }
          
        var generateCount = 1;
        for(var i=0; i<generateCount; ++i) {
          var response;
          try {
            const maxTokens = 1024;
            response = await this.openai.generateChat(this.currentMessages, {max_tokens: maxTokens});
          } catch(generateErr) {
            console.re.error(generateErr);
            continue;
          }
          if (!response) {
            console.re.warn(`openai:generateChat> null generate response, skipping...`);
            continue;
          }
  
          console.re.log(`${response.status} ${response.statusText}: ${JSON.stringify(response.data)}`);
    
          if (response.data && response.data.choices.length > 0){
            console.re.log(`openai:generateChat> ${response.data.choices[0].message.content}`);
            this.currentMessages.push(response.data.choices[0].message);
          } else {
            console.re.warn(`openai:generateChat> no responses data and/or choices`);
          }
        }
        
        const episodeName = `adventure-${currentUserPrompt.date}-${(this.continueCount + 1).toString().padStart(3, '0')}`;
        const rawTxtStory = currentUserPrompt.prompt + "\n" + this.currentMessages.splice(currentIndex)
            .filter((msg) => msg.role === "assistant")
            .map((msg) => msg.content)
            .join("\n");
        const aiModel = this.openai.getCurrentModel();
        await this.moderateEpisode({
          name: episodeName,
          date: currentUserPrompt.date,
          user: currentUserPrompt.user,
          model: aiModel,
          location: currentLocation,
          story: rawTxtStory
        });
  
        this.continueCount++;
      } catch (err) {
        console.re.warn(`runOpenAIGenerator> Error generating prompt for ${currentUserPrompt.user}`);
        console.re.error(err);
      }
  
      setTimeout(this.runGoopsAndGoblinsOpenAIGenerator.bind(this), 100);
    }

  /**
   * Get the number of tokens to have the ai generate.
   * @param {number} generateIndex The current generation round
   * @param {number} generateCount The total number of generations
   * @returns max number of tokens to generate
   */
  getMaxTokens(generateIndex, generateCount) {
    return (generateIndex==0) ? 420 :
      (generateIndex==1) ? 120 :
      // (generateIndex==(generateCount-1)) ? 32 :
      80;
  }

  /**
   * Mark the current episode for completion.
   */
  markContinue() {
    this.continue = true;
  }

  previousLocationIndex = -1
  /**
   * Get a random location.  Always returns a different location from the previous.
   * @returns an episode location id
   */
  getRandomLocation() {
    var random5 = getRandomInt(5);
    while (random5 == this.previousLocationIndex) random5 = getRandomInt(5);
    this.previousLocationIndex = random5;
    return random5 == 0 ? "kitchen" : 
      random5 == 1 ? "living-room" :
      random5 == 2 ? "italian-restaurant" :
      random5 == 3 ? "litter-box" : 
      "transmission-factory";
  }

  getLocationPrompt(location) {
    var prompt;
    switch(location) {
      case "kitchen":
        prompt = "Jack's outdated kitchen";
        break;
      case "living-room":
        prompt = "Jack's living room with a big blue couch and Goopsea's large cat tree";
        break;
      case "italian-restaurant":
        prompt = "a chain Italian restaurant";
        break;
      case "litter-box":
        prompt = "a spare bedroom in Jack's house covered in sand";
        break;
      case "transmission-factory":
        prompt = "the transmission plant where Jack works";
        break;
      default: prompt = "";
    }
    return prompt;
  }

  /**
   * Runs story through OpenAI moderation endpoint.
   * 
   * If episode passes mod check, add to episode processor queue.
   * If episode fails mod check, mark story as DIRTY and add to raw/dirty folder for manual review.
   * 
   * @param {RawEpisode} rawEpisode unprocessed episode
   */
  async moderateEpisode(rawEpisode) {
    var modResponse;
    try {
      modResponse = await this.openai.moderate(rawEpisode.story);
      console.re.log(`moderateEpisode> ${modResponse.status} ${modResponse.statusText}`);
      console.re.log(JSON.stringify(modResponse.data));
    } catch (err) {
      console.re.warn(`openai:moderate> Error moderating story for ${rawEpisode.user}`);
      console.re.error(err);
    }

    if (modResponse && modResponse.data && modResponse.data.results.length > 0) {
      // const flagged = modResponse.data.results[0].flagged;
      const modCategories = modResponse.data.results[0].categories;

      if (
        modCategories["hate"] ||
        modCategories["hate/threatening"] ||
        modCategories["self-harm"] ||
        modCategories["sexual/minors"]
      ) {
        const dirtyFilename = `episodes/raw/dirty/DITRY-${rawEpisode.date.replaceAll(":", "-")}-${rawEpisode.user}.json`
        
        console.re.warn(`✖✖✖ FILTH! ✖✖✖ Story failed moderation check, saving to ${dirtyFilename}...`);
        
        fs.writeFile(dirtyFilename, JSON.stringify(rawEpisode), "utf-8", (err) => {
          if (err) console.re.error(err);
          else console.re.warn(`☠ DIRTY EPISODE OF GOOPSEA READY FOR MANUAL REVIEW! ☠`);
        });
      } else {
        console.re.log(`Passed mod check!  Adding story to episode processing queue...`);

        this.rawEpisodeQueue.push(rawEpisode);
      }
    } else {
      const rawEpisodeJsonFilename = `episodes/raw/inbox/story-${rawEpisode.date.replaceAll(":", "-")}-${rawEpisode.user}.json`
      console.re.warn(`Could not auto-moderate: Adding story to inbox for manual review.\nManually approve story with:\ncurl -X POST -H "Content-Type: application/json" -d @${rawEpisodeJsonFilename} http://localhost:3000/addStory`);
      fs.writeFile(rawEpisodeJsonFilename, JSON.stringify(rawEpisode), "utf-8", (err) => {
        if (err) console.re.error(err);
        else console.re.log(`Saved story to ${rawEpisodeJsonFilename}`);
      });
    }
  }

  /**
   * Run episode process loop.
   * 
   * 1. check if story in queue to process, poll from queue if not empty
   * 2. process story into episode json
   * 3. save episode json to data/ folder
   */
  async runProcessor() {
    if (!this.running) return;

    if (this.rawEpisodeQueue.length >= 1) {
      const rawEpisode = this.rawEpisodeQueue.shift();
      const episode = await this.processEpisode(rawEpisode);
      this.saveEpisode(rawEpisode.name, episode);
    }

    setTimeout(this.runProcessor.bind(this), 100);
  }

  /**
   * Run Goops & Goblins process loop.
   */
  async runGoopsAndGoblinsProcessor() {
    if (!this.running) return;

    if (this.rawEpisodeQueue.length >= 1) {
      const rawEpisode = this.rawEpisodeQueue.shift();
      const episode = await this.processEpisode(rawEpisode, true);
      this.saveEpisode(rawEpisode.name, episode);
    }

    setTimeout(this.runGoopsAndGoblinsProcessor.bind(this), 100);
  }

  /**
   * @typedef {Object} RawEpisode
   * @property {string} name story name
   * @property {string} date timestamp for when story was generated
   * @property {string} user user who submitted prompt
   * @property {string} model ai model used to generate story
   * @property {string} location the episode location id
   * @property {string} story formatted ai generated story
   * @property {string} ai_img_background base 64 generated image for background
   */

  /**
   * @typedef {Object} Direction
   * @property {string} type
   * @property {string} target
   */

  /**
   * @typedef {Object} Episode
   * @property {string} id 
   * @property {string} date timestamp for when story was generated
   * @property {string} user 
   * @property {string} model ai model used to generate story
   * @property {Array<Direction>} directions
   * @property {string} ai_img_background base 64 generated image for background
   */

  /**
   * Process raw episode to a playable episode object.
   * @param {RawEpisode} rawEpisode raw episode json without stage directions or processed TTS
   * @param {boolean} isAdventure if true, disables boilerplate episode crap
   * @returns a processed episode object with stage directions & base64 encoded TTS audio
   */
  async processEpisode(rawEpisode, isAdventure=false) {
    const episode = {
      id: rawEpisode.name,
      date: rawEpisode.date,
      user: rawEpisode.user,
      model: rawEpisode.model,
      directions: [],
      ai_img_background: rawEpisode.ai_img_background
    };

    if (!isAdventure) {
      episode.directions.push({ type: "intro" });
      episode.directions.push({
        type: "play-timeline",
        target: "establishing-shot-house"
      });
      episode.directions.push({
        type: "change-location",
        target: rawEpisode.location
      });
      episode.directions.push({
        type: "change-camera",
        target: "wide",
      });
      episode.directions.push({
        type: "pause",
        duration: 1
      });
    }
    
    const formattedLines = rawEpisode
      .story
      .split("\n")
      .map(x => x.trim());

    for (const line of formattedLines) {
      // console.re.log(`$$$ ${line}`);
      if (line === "") continue;

      const match = line.match(this.lineRegex);

      var actor;
      var dialog;
      if (match) {
        actor = match[1];
        if (!actor || actor === "") actor = "narrator";
        else actor = actor.trim().toLowerCase()
        dialog = match[2];
      } else {
        actor = "narrator";
        dialog = line;
      }

      if (dialog === "") continue;

      await this.addLine(actor, dialog, episode);

      episode.directions.push({
        type: "pause",
        duration: 0.25 + (Math.pow(Math.E, -3) * getRandomInt(50))
      });
    }
    
    if (!isAdventure) episode.directions.push({ type: "end" });
    
    return episode;
  }

  async addLine(actor, dialog, episode) {
    const chunks = chunkify(dialog);
    for (const chunk of chunks) {
      // vary camera angle for every chunk of dialoge
      const random100 = getRandomInt(100);
      const cameraTarget = random100 < 50 ? actor :
        random100 < 75 ? `${actor}-close` :
        "wide";
      episode.directions.push({
        type: "change-camera",
        target: cameraTarget,
      });

      // var base64Audio = "";
      //*
      var base64Audio;
      try {
        const voiceType = "Standard"; //"Neural2";
        base64Audio =
          actor === "jack" ? await this.tts.textToSpeech(chunk, `en-US-${voiceType}-D`, { pitch: 4.8, })
            : actor === "goopsea" ? await this.tts.textToSpeech(chunk, `en-US-${voiceType}-J`, { pitch: -1.8, })
            : actor === "woadie" ? await this.tts.textToSpeech(chunk, `de-DE-${voiceType}-D`, { pitch: -4.8, speakingRate: 1.4 })
            : actor === "narrator" ? await this.tts.textToSpeech(chunk, `en-US-${voiceType}-I`, { pitch: -3.6, speakingRate: 1.11 })
            : await this.tts.textToSpeech(chunk, this.tts.getVoice(actor), this.tts.getRandomPitch());
      } catch (error) {
        console.re.warn(`TTS error - problem generating audio ${error.name}`);
      }
      //*/

      // text-to-speech chunk
      episode.directions.push({
        type: "dialog",
        target: actor,
        text: chunk,
        audio: base64Audio
      });
    }
  }

  /**
   * Save the episode to a JSON file.
   * @param {string} name save file name
   * @param {Episode} episode
   */
  saveEpisode(name, episode, callback=()=>{}) {
    if (episode.directions.length <= 6) { // the base number of directions added (currently: intro, establishing, location, cam, pause, end)
      console.re.warn(`episode ${name} has no dialog and will be skipped.  Please check connection to KoboldAI API.`);
      // TODO should this also stop the queue?
      return;
    }

    fs.writeFile(`episodes/${name}.json`, JSON.stringify(episode), "utf-8", (err) => {
      if (err) console.re.error(err);
      else console.re.log(`(^.^) NEW EPISODE OF GOOPSEA IS AVAILABLE: ${name}!`);
      if (callback) callback();
    });
  }
};