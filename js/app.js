// /js/app.js
import openAIService from './openai-service.js';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Initialize service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered: ', reg))
      .catch(err => console.log('SW failed: ', err));
  }

  // Set up UI interactions
  setupSliders();
  setupButtons();
  setupChatbot();
  
  // Check if API key is set
  if (!localStorage.getItem('openai_api_key')) {
    showApiKeyPrompt();
  }
}

function setupSliders() {
  const moodSlider = document.getElementById('mood');
  const energySlider = document.getElementById('energy');
  
  // Mood slider emojis
  const moodEmojis = ['😞', '😕', '😐', '🙂', '😊'];
  moodSlider.addEventListener('input', () => updateEmoji(moodSlider, moodEmojis));
  
  // Energy slider emojis
  const energyEmojis = ['😴', '🥱', '😐', '🙂', '😄'];
  energySlider.addEventListener('input', () => updateEmoji(energySlider, energyEmojis));
  
  // Initialize sliders with default values
  updateEmoji(moodSlider, moodEmojis);
  updateEmoji(energySlider, energyEmojis);
}

function updateEmoji(slider, emojis) {
  const value = slider.value;
  const emojiSpan = slider.previousElementSibling.querySelector('.emoji-scale');
  emojiSpan.textContent = emojis[value-1];
}

function setupButtons() {
  // Submit button
  document.getElementById('submit').addEventListener('click', handleSubmit);
  
  // Export button
  document.getElementById('export').addEventListener('click', exportData);
  
  // Reminder button
  document.getElementById('remind').addEventListener('click', setReminder);
}

function setupChatbot() {
  const askBtn = document.getElementById('ask-btn');
  const userInput = document.getElementById('user-input');
  
  askBtn.addEventListener('click', handleUserQuestion);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserQuestion();
  });
}

async function handleSubmit() {
  const mood = document.getElementById('mood').value;
  const energy = document.getElementById('energy').value;
  const date = new Date().toISOString().split('T')[0];

  const entry = { date, mood, energy };
  let entries = JSON.parse(localStorage.getItem('healthEntries') || '[]');
  entries.push(entry);
  localStorage.setItem('healthEntries', JSON.stringify(entries));

  // Add visual feedback
  this.classList.add('pulse');
  createConfetti();
  
  // Generate AI suggestion
  try {
    const tip = await openAIService.generateWellnessTip(mood, energy);
    document.getElementById('ai-response').textContent = tip;
  } catch (error) {
    document.getElementById('ai-response').textContent = 
      "Great job checking in today! Keep tracking your mood and energy to identify patterns.";
    console.error('Error generating wellness tip:', error);
  }
  
  // Reset animation after completion
  setTimeout(() => {
    this.classList.remove('pulse');
  }, 2000);
}

function exportData() {
  const entries = JSON.parse(localStorage.getItem('healthEntries') || '[]');
  if (entries.length === 0) {
    alert("No data to export.");
    return;
  }

  let csv = 'Date,Mood (1-5),Energy (1-5)\n';
  entries.forEach(e => {
    csv += `${e.date},${e.mood},${e.energy}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'health-report.csv';
  a.click();
}

async function setReminder() {
  try {
    const success = await requestNotificationPermission();
    if (success) {
      alert('🔔 Reminder set! You\'ll get daily prompts.');
    } else {
      alert('Please enable notifications to get reminders.');
    }
  } catch (error) {
    console.error('Error setting reminder:', error);
    alert('Failed to set reminder. Please check console for details.');
  }
}

async function handleUserQuestion() {
  const userInput = document.getElementById('user-input');
  const question = userInput.value.trim();
  const aiResponse = document.getElementById('ai-response');
  
  if (!question) return;
  
  // Show loading state
  aiResponse.textContent = "Thinking...";
  userInput.disabled = true;
  
  try {
    const response = await openAIService.answerHealthQuestion(question);
    aiResponse.textContent = response;
  } catch (error) {
    aiResponse.textContent = "I'm having trouble connecting right now. Please try again later.";
    console.error('Error getting AI response:', error);
  } finally {
    userInput.value = '';
    userInput.disabled = false;
  }
}

function createConfetti() {
  const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#4cc9f0', '#f9c74f'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = Math.random() * 15 + 5 + 'px';
    confetti.style.height = Math.random() * 15 + 5 + 'px';
    confetti.style.opacity = Math.random() * 0.5 + 0.5;
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
    
    document.body.appendChild(confetti);
    
    // Remove confetti after animation completes
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

function showApiKeyPrompt() {
  // In a real app, you wouldn't ask for the API key on the client side
  // This is just for demonstration purposes
  // const apiKey = prompt('Please enter your OpenAI API key for full functionality:');
  // if (apiKey) {
  //   openAIService.setApiKey(apiKey);
  // }
}