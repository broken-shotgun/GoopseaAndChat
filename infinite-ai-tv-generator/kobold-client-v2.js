const fetch = require("node-fetch");
const { json } = require("./utils");

module.exports = class KoboldAIClient {
  constructor() {
    this.baseUrl = process.env.STABLEHORDER_BASE_URL;
  }

  ///////////////////////////
  // KoboldAI API Endpoints /
  ///////////////////////////

  /**
   * Load KoboldAI story.
   * @param {string} name 
   * @returns promise
   * @deprecated story handled differently in v2
   */
  loadStory(name) {
    // intentionally left blank
  }

  /**
   * Generate an AI response from prompt asynchronously.
   * @param {string} prompt 
   * @param {object} options additional generate options
   * @returns promise
   */
  generate(prompt, options = {}) {
    const requestUrl = `${this.baseUrl}/generate/text/async`;
    const postData = {
      prompt: prompt,
      params: {
        n: 1,
        max_context_length: 1024,
        max_length: 80,
        ...options
      }
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
        console.log(`KoboldAI/v2:generate> ${JSON.stringify(data)}`);
        if (data)
          return data;
        return {};
      })
      .catch((ex) => {
        console.error(`KoboldAI/v2:generate> error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.error(ex.response.data);
        } else {
          console.error(ex.stack);
        }
        return [];
      });
  }

  /**
   * Check on the status of async generate requests.
   * 
   * Note: id expires after 20 minutes.
   * 
   * @param {string} id asynchronous text generate request id (from /generate endpoint) 
   * @returns 
   */
  getGenerateResults(id) {
    const requestUrl = `${this.baseUrl}/generate/text/status/${id}`;
    return fetch(requestUrl, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(json)
      .then((data) => {
        console.log(`KoboldAI/v2:getGenerateResults> ${JSON.stringify(data)}`);
        if (data && data.generations && data.generations.length > 0)
          return data.generations;
        return [];
      })
      .catch((ex) => {
        console.error(`KoboldAI/v2:getGenerateResults> error ${ex.name}: ${ex.message}`);
        if (ex.response) {
          console.error(ex.response.data);
        } else {
          console.error(ex.stack);
        }
        return [];
      });
  }

  /**
   * Get the current story.
   * @returns promise
   * @deprecated story handled differently in v2
   */
  getStory() {
    // intentionally left empty
  }

  /**
   * Add text to the end of the story.
   * 
   * Note: this does not generate text.
   * @param {string} prompt text to add to story
   * @returns promise
   * @deprecated story handled differently in v2
   */
  addStory(prompt) {
    // intentionally left empty
  }

  /**
   * Remove last story chunk.
   * @returns promise
   * @deprecated story handled differently in v2
   */
  removeStoryEnd() {
    // intentionally left empty
  }

  /**
   * Save story remotely using given KoboldAI save.
   * @param {string} saveName 
   * @returns promise
   * @deprecated story handled differently in v2
   */
  saveStoryRemote(saveName) {
    // intentionally left empty
  }

  /**
   * Get the currently loaded AI model.
   * @returns promise
   * @deprecated model is returned in generate request
   */
  getCurrentModel() {
    // intentionally left empty
  }

  /**
   * Clears the entire story.
   * @returns promise
   * @deprecated story handled differently in v2
   */
  clearStory() {
    // intentionally left empty
  }
};
