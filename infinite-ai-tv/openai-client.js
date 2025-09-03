import OpenAI from 'openai';

export class OpenAIClient {
  constructor() {
    // https://platform.openai.com/docs/pricing
    this.openai = new OpenAI({
      baseURL: "http://localhost:11434/v1", // Local Ollama API endpoint
      apiKey: "ollama" // Dummy key, not used by Ollama
    });
    //this.model = "gpt-3.5-turbo";
    this.model = "gpt-oss:20b";
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
};
