const { Configuration, OpenAIApi } = require("openai");

module.exports = class OpenAIClient {
  constructor() {
    this.loadOpenAI();
    //this.model = "gpt-3.5-turbo";
    this.model = "gpt-3.5-turbo-16k";
    // this.model = "gpt-4";
  }

  loadOpenAI() {
    this.configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  /**
   * Get the currently loaded AI model.
   * @returns promise
   */
  getCurrentModel() {
    return this.model;
  }

  /////////////////////////
  // OpenAI API Endpoints /
  /////////////////////////

  /**
   * Generate an AI response for given prompt.
   * https://platform.openai.com/docs/api-reference/completions/create
   * 
   * Note: only compatimble with Legacy GPT-3 models
   * https://platform.openai.com/docs/models/whisper
   * 
   * @param {string} prompt a string or array of strings
   * @param {object} options additional generate options
   * @returns promise that will return AI generated response
   */
  generate(prompt, options = {}) {
    return this.openai.createCompletion({
      model: "davinci", //this.getCurrentModel(),
      prompt: prompt,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      // stop: [" Goopsea:", " Jack:", " Woadie:"],
      ...options
    });
  }

  /**
   * Generate chat completion for list of messages.
   * https://platform.openai.com/docs/api-reference/chat
   * 
   * Note: only compatible with GPT-3.5 or GPT-4 models.
   * https://platform.openai.com/docs/models/gpt-3-5
   * https://platform.openai.com/docs/models/gpt-4
   * 
   * @param {object} messages list of messages (role, content)
   * @param {object} options additional generate options
   * @returns promise that will return AI chat completion
   */
  generateChat(messages=[], options = { max_tokens: 120 }) {
    return this.openai.createChatCompletion({
      model: this.model,
      messages,
      // temperature: 0.9, // default 1
      // top_p: 1, // 1 default
      // frequency_penalty: 1.0, // 0 default
      presence_penalty: -1.0, // 0 default
      // stop: [" Goopsea:", " Jack:", " Woadie:"],
      ...options
    });
  }

  /**
   * https://platform.openai.com/docs/api-reference/images
   * @param {string} prompt 
   * @returns promise that will return AI generated image (base64 encoded)
   */
  generateImage(prompt) {
    return this.openai.createImage({
      prompt: `a location background based on the following story prompt: ${prompt}`,
      n: 1,
      size: "256x256", // 8 pixels per unit //"512x512", // 16 pixels per unit //"1024x1024", // 68.5 pixels per unit
      response_format: "b64_json"
    });
  }

  /**
   * Classifies if text violates OpenAI's Content Policy.
   * https://platform.openai.com/docs/api-reference/moderations/create
   * @param {string} input 
   * @returns promise that will return moderationg categories
   */
  moderate(input) {
    return this.openai.createModeration({
      input: JSON.stringify(input)
    });
  }
};
