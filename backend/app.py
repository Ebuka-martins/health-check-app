from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Health Check API is running"})

@app.route('/api/wellness-tip', methods=['POST'])
def generate_wellness_tip():
    try:
        data = request.get_json()
        mood = data.get('mood', 3)
        energy = data.get('energy', 3)
        
        prompt = f"""As a friendly wellness assistant, provide a short, encouraging wellness tip based on:
        - Mood rating: {mood}/5 (1 being very sad, 5 being very happy)
        - Energy rating: {energy}/5 (1 being very tired, 5 being very energetic)
        
        Keep the response to 1-2 sentences, positive and actionable."""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
            temperature=0.7
        )
        
        tip = response.choices[0].message.content.strip()
        return jsonify({"tip": tip})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/answer-question', methods=['POST'])
def answer_question():
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({"error": "Question is required"}), 400
            
        prompt = f"""As a wellness assistant, provide helpful, evidence-based advice about:
        {question}
        
        Keep the response concise (2-3 sentences), practical, and encouraging."""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content.strip()
        return jsonify({"answer": answer})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)