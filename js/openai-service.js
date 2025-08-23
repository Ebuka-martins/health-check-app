// /js/openai-service.js
class OpenAIService {
  constructor() {
    // Use your backend API URL
    // For local development: http://localhost:5000
    // For production: your deployed backend URL
    this.baseURL = 'http://localhost:5000/api';
  }

  async generateWellnessTip(mood, energy) {
    try {
      const response = await fetch(`${this.baseURL}/wellness-tip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mood, energy })
      });

      if (!response.ok) {
        throw new Error('Failed to generate wellness tip');
      }

      const data = await response.json();
      return data.tip;
    } catch (error) {
      console.error('Error generating wellness tip:', error);
      throw error;
    }
  }

  async answerHealthQuestion(question) {
    try {
      const response = await fetch(`${this.baseURL}/answer-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error('Error getting answer:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const openAIService = new OpenAIService();
export default openAIService;