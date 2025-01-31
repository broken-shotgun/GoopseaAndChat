const fetch = require("node-fetch");
const { json } = require("./utils");

module.exports = class KoboldAIClient {
  constructor() {
    this.baseUrl = process.env.KOBOLDAI_BASE_URL;
    this.saved = false;
  }

  ///////////////////////////
  // KoboldAI API Endpoints /
  ///////////////////////////

  /**
   * Load KoboldAI story.
   * @param {string} name 
   * @returns promise
   */
  loadStory(name) {
    const requestUrl = `${this.baseUrl}/api/v1/story/load`;
    const postData = {
      name: name,
    };
    return fetch(requestUrl, {
      method: "put",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.re.log(`KoboldAI:loadStory> story loaded successfully!`);
      })
      .catch((ex) => {
        console.re.error(`KoboldAI:loadStory> error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
        return [];
      });
  }

  /**
   * Generate an AI response from prompt.
   * @param {string} prompt 
   * @param {object} options additional generate options
   * @returns promise
   */
  generate(prompt, options = {}) {
    const requestUrl = `${this.baseUrl}/api/v1/generate`;
    const postData = {
      prompt: prompt,
      ...options,
    };
    return fetch(requestUrl, {
      method: "post",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(json)
      .then((data) => {
        console.re.log(`KoboldAI:generate> ${JSON.stringify(data)}`);
        if (data && data.results && data.results.length > 0)
          return data.results;
        return [];
      })
      .catch((ex) => {
        console.re.error(`KoboldAI:generate> error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
        return [];
      });
  }

  /**
   * Get the current story.
   * @returns promise
   */
  getStory() {
    const requestUrl = `${this.baseUrl}/api/v1/story`;
    return fetch(requestUrl, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(json)
      .then((data) => {
        console.re.log(`KoboldAI:getStory> ${JSON.stringify(data)}`);
        if (data && data.results && data.results.length > 0)
          return data.results;
        return [];
      })
      .catch((ex) => {
        console.re.error(`KoboldAI:getStory> error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
        return [];
      });
  }

  /**
   * Add text to the end of the story.
   * 
   * Note: this does not generate text.
   * @param {string} prompt text to add to story
   * @returns promise
   */
  addStory(prompt) {
    if (!prompt) {
      console.re.warn("KoboldAI> prompt is missing");
      return;
    }

    const requestUrl = `${this.baseUrl}/api/v1/story/end`;
    const postData = {
      prompt: prompt,
    };
    return fetch(requestUrl, {
      method: "post",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.re.log("KoboldAI> added story end");
        this.saved = false;
      })
      .catch((ex) => {
        console.re.error(
          `koboldai add story end error ${ex.name}: ${ex.message}`
        );
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
      });
  }

  /**
   * Remove last story chunk.
   * @returns promise
   */
  removeStoryEnd() {
    const requestUrl = `${this.baseUrl}/api/v1/story/end/delete`;
    const postData = {};
    return fetch(requestUrl, {
      method: "post",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.re.log("KoboldAI> removed story end");
      })
      .catch((ex) => {
        console.re.error(
          `koboldai remove story end error ${ex.name}: ${ex.message}`
        );
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
      });
  }

  /**
   * Save story remotely using given KoboldAI save.
   * @param {string} saveName 
   * @returns promise
   */
  saveStoryRemote(saveName) {
    const requestUrl = `${this.baseUrl}/api/v1/story/save`;
    const postData = {
      name: saveName,
    };
    return fetch(requestUrl, {
      method: "put",
      body: JSON.stringify(postData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.re.log(`KoboldAI> saved story '${saveName}'`);
        this.saved = true;
      })
      .catch((ex) => {
        console.re.error(`koboldai save story error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
      });
  }

  /**
   * Get the currently loaded AI model.
   * @returns promise
   */
  getCurrentModel() {
    const requestUrl = `${this.baseUrl}/api/v1/model`;
    return fetch(requestUrl, {
      method: "get",
      headers: {
        Accept: "application/json",
      },
    })
      .then(json)
      .then((data) => {
        return data.result;
      })
      .catch((ex) => {
        console.re.error(`koboldai get model error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
        return "error fetching model name";
      });
  }

  /**
   * Clears the entire story.
   * @returns promise
   */
  clearStory() {
    const requestUrl = `${this.baseUrl}/api/v1/story`;
    return fetch(requestUrl, {
      method: "delete",
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => {
        console.re.log(`KoboldAI> cleared story`);
      })
      .catch((ex) => {
        console.re.error(
          `koboldai clear story error ${ex.name}: ${ex.message}`
        );
        if (ex.response) {
          console.re.error(ex.response.data);
        } else {
          console.re.error(ex.stack);
        }
        return "error clearing story";
      });
  }
};
