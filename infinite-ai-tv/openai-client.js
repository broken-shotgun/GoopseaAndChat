import OpenAI from 'openai';

export class OpenAIClient {
  constructor() {
    // https://platform.openai.com/docs/pricing
    this.openai = new OpenAI();
    this.model = "gpt-3.5-turbo";
    // this.model = "gpt-4-turbo";
  }

  /**
   * Get the currently loaded AI model.
   * 
   * Monitor cost here: https://platform.openai.com/usage
   * 
   * @returns promise
   */
  getCurrentModel() {
    return this.model;
  }

  /////////////////////////
  // OpenAI API Endpoints /
  /////////////////////////

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
    return this.openai.chat.completions.create({
      model: this.model,
      messages,
      store: false,
      ...options,
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
