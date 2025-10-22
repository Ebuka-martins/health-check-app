document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const askBtn = document.getElementById("ask-btn");
  const userInput = document.getElementById("user-input");
  const aiResponse = document.getElementById("ai-response");
  const submitBtn = document.getElementById("submit");
  const exportBtn = document.getElementById("export");
  const trendsBtn = document.getElementById("trends");
  const insightsBtn = document.getElementById("insights");
  const remindBtn = document.getElementById("remind");
  const communityBtn = document.getElementById("community");
  const emergencyBtn = document.getElementById("emergency");
  const quickBtns = document.querySelectorAll('.quick-btn');

  // State Management
  let healthData = JSON.parse(localStorage.getItem('healthData')) || {
    entries: [],
    streak: 0,
    lastEntry: null
  };

  // Initialize the app
  initApp();

  // Event Listeners
  askBtn.addEventListener("click", handleChat);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') handleChat();
  });

  submitBtn.addEventListener("click", handleSubmit);
  exportBtn.addEventListener("click", handleExport);
  trendsBtn.addEventListener("click", handleTrends);
  insightsBtn.addEventListener("click", handleInsights);
  remindBtn.addEventListener("click", handleReminder);
  communityBtn.addEventListener("click", handleCommunity);
  emergencyBtn.addEventListener("click", handleEmergency);

  quickBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      userInput.value = e.target.dataset.prompt;
      handleChat();
    });
  });

  // Trackers real-time feedback
  setupTrackerFeedback();

  // Functions
  function initApp() {
    updateStats();
    updateDate();
    updateStreak();
    loadMotivation();
  }

  function updateDate() {
    const today = new Date();
    document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function updateStreak() {
    const today = new Date().toDateString();
    const lastEntry = healthData.lastEntry;
    
    if (lastEntry === today) {
      // Already logged today
      return;
    }
    
    if (lastEntry) {
      const lastDate = new Date(lastEntry);
      const todayDate = new Date();
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        healthData.streak++;
      } else if (diffDays > 1) {
        healthData.streak = 0;
      }
    }
    
    document.getElementById('checkin-streak').textContent = healthData.streak;
    localStorage.setItem('healthData', JSON.stringify(healthData));
  }

  function updateStats() {
    if (healthData.entries.length === 0) {
      document.getElementById('avg-mood').textContent = '0.0';
      document.getElementById('avg-energy').textContent = '0.0';
      return;
    }

    const avgMood = healthData.entries.reduce((sum, entry) => sum + entry.mood, 0) / healthData.entries.length;
    const avgEnergy = healthData.entries.reduce((sum, entry) => sum + entry.energy, 0) / healthData.entries.length;

    document.getElementById('avg-mood').textContent = avgMood.toFixed(1);
    document.getElementById('avg-energy').textContent = avgEnergy.toFixed(1);
  }

  function setupTrackerFeedback() {
    const trackers = ['mood', 'energy', 'sleep', 'exercise'];
    
    trackers.forEach(tracker => {
      const slider = document.getElementById(tracker);
      const feedback = document.getElementById(`${tracker}-feedback`);
      
      slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        feedback.textContent = getTrackerFeedback(tracker, value);
        feedback.style.color = getTrackerColor(value);
      });
      
      // Set initial feedback
      feedback.textContent = getTrackerFeedback(tracker, parseInt(slider.value));
      feedback.style.color = getTrackerColor(parseInt(slider.value));
    });
  }

  function getTrackerFeedback(tracker, value) {
    const feedbacks = {
      mood: {
        1: "Feeling really down today. Remember, it's okay to not be okay. 💙",
        2: "Having a tough day. Small steps still count! 🌱",
        3: "Feeling neutral. Maybe try something new to boost your mood? 🌈",
        4: "Good mood! Keep that positive energy flowing! ✨",
        5: "Amazing! You're radiating positive vibes today! 🌟"
      },
      energy: {
        1: "Very low energy. Consider some rest or gentle movement. 🛌",
        2: "Low energy. A short walk might help boost you up! 🚶",
        3: "Moderate energy. Good balance for the day! ⚡",
        4: "High energy! Perfect time for productivity! 🚀",
        5: "Super charged! Make the most of this energetic day! 🌞"
      },
      sleep: {
        1: "Poor sleep. Consider a relaxing bedtime routine tonight. 🌙",
        2: "Restless night. Try some deep breathing exercises. 💤",
        3: "Average sleep. Maintaining good habits! 🛌",
        4: "Good rest! Your body will thank you today. 😴",
        5: "Excellent sleep! You're well-rested and ready! ⭐"
      },
      exercise: {
        1: "Sedentary day. Even 5 minutes of movement helps! 🛋️",
        2: "Light activity. Every bit counts toward better health! 🚶",
        3: "Moderate movement. Good job staying active! 🏃",
        4: "Active day! Your body is loving this! 🏋️",
        5: "Very active! You're crushing your fitness goals! 🦸"
      }
    };
    
    return feedbacks[tracker][value] || "Keep tracking your progress!";
  }

  function getTrackerColor(value) {
    const colors = {
      1: '#f94144', // Red
      2: '#f9c74f', // Yellow
      3: '#90be6d', // Light Green
      4: '#43aa8b', // Green
      5: '#577590'  // Blue
    };
    return colors[value] || '#4361ee';
  }

  async function handleChat() {
    const message = userInput.value.trim();
    if (!message) return;

    aiResponse.textContent = "Thinking...";
    userInput.value = "";

    try {
      const res = await fetch("http://127.0.0.1:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      aiResponse.textContent = data.reply;
      aiResponse.parentElement.style.animation = 'typewriter 1s ease';
    } catch (error) {
      console.error("Error:", error);
      aiResponse.textContent = "Oops! Something went wrong. Please try again.";
    }
  }

  function handleSubmit() {
    const today = new Date().toDateString();
    
    // Check if already submitted today
    if (healthData.lastEntry === today) {
      showNotification('You have already submitted today! Come back tomorrow. 🌟', 'info');
      return;
    }

    const entry = {
      date: today,
      mood: parseInt(document.getElementById('mood').value),
      energy: parseInt(document.getElementById('energy').value),
      sleep: parseInt(document.getElementById('sleep').value),
      exercise: parseInt(document.getElementById('exercise').value),
      timestamp: new Date().toISOString()
    };

    healthData.entries.push(entry);
    healthData.lastEntry = today;
    healthData.streak = healthData.streak + 1;

    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    updateStats();
    showNotification('Daily check-in submitted successfully! 🎉', 'success');
    createConfetti();
    
    // Ask AI for daily insight
    getDailyInsight(entry);
  }

  function handleExport() {
    if (healthData.entries.length === 0) {
      showNotification('No data to export yet! Start tracking your wellness. 📊', 'info');
      return;
    }

    generatePDFReport();
    showNotification('PDF report generated successfully! 📄', 'success');
  }

  function generatePDFReport() {
    // Create a new window for PDF content
    const pdfWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString();
    
    // Calculate statistics
    const totalEntries = healthData.entries.length;
    const avgMood = (healthData.entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries).toFixed(1);
    const avgEnergy = (healthData.entries.reduce((sum, entry) => sum + entry.energy, 0) / totalEntries).toFixed(1);
    const avgSleep = (healthData.entries.reduce((sum, entry) => sum + entry.sleep, 0) / totalEntries).toFixed(1);
    const avgExercise = (healthData.entries.reduce((sum, entry) => sum + entry.exercise, 0) / totalEntries).toFixed(1);

    // Get recent trend
    const recentEntries = healthData.entries.slice(-7);
    const moodTrend = calculateTrend(recentEntries, 'mood');
    const energyTrend = calculateTrend(recentEntries, 'energy');

    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wellness Report</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 40px; 
            color: #2b2d42;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #4361ee;
          }
          .header h1 { 
            color: #4361ee; 
            margin-bottom: 10px;
          }
          .summary { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 10px; 
            margin-bottom: 30px;
            border-left: 5px solid #4cc9f0;
          }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .stat-card { 
            background: white; 
            padding: 15px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 4px solid #7209b7;
          }
          .stat-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #3a0ca3; 
            display: block;
          }
          .stat-label { 
            color: #666; 
            font-size: 14px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
          }
          th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #ddd;
          }
          th { 
            background: #4361ee; 
            color: white;
          }
          tr:nth-child(even) { 
            background: #f8f9fa; 
          }
          .trends { 
            background: #e8f4f8; 
            padding: 20px; 
            border-radius: 10px; 
            margin-bottom: 30px;
            border-left: 5px solid #f9c74f;
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .emoji { 
            font-size: 18px; 
            margin-right: 5px;
          }
          .insight { 
            background: #fff3cd; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 20px 0;
            border-left: 5px solid #ffc107;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Wellness Progress Report</h1>
          <p>Generated on ${today} • ${totalEntries} entries tracked</p>
          <p>Current Streak: ${healthData.streak} days 🔥</p>
        </div>
        
        <div class="summary">
          <h2>📊 Executive Summary</h2>
          <p>Your wellness journey shows consistent tracking with an average mood of ${avgMood}/5 and energy of ${avgEnergy}/5. Keep up the great work!</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">${avgMood}/5</span>
            <span class="stat-label">Average Mood</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${avgEnergy}/5</span>
            <span class="stat-label">Average Energy</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${avgSleep}/5</span>
            <span class="stat-label">Average Sleep</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${avgExercise}/5</span>
            <span class="stat-label">Average Exercise</span>
          </div>
        </div>
        
        <div class="trends">
          <h2>📈 Recent Trends (Last 7 Days)</h2>
          <p><span class="emoji">😊</span> Mood: ${moodTrend}</p>
          <p><span class="emoji">⚡</span> Energy: ${energyTrend}</p>
        </div>
        
        <div class="insight">
          <h3>💡 Key Insight</h3>
          <p>${getPDFInsight(avgMood, avgEnergy, avgSleep, avgExercise)}</p>
        </div>
        
        <h2>📝 Detailed Entries</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Mood</th>
              <th>Energy</th>
              <th>Sleep</th>
              <th>Exercise</th>
            </tr>
          </thead>
          <tbody>
            ${healthData.entries.map(entry => `
              <tr>
                <td>${entry.date}</td>
                <td>${'⭐'.repeat(entry.mood)}</td>
                <td>${'⚡'.repeat(entry.energy)}</td>
                <td>${'😴'.repeat(entry.sleep)}</td>
                <td>${'🏃'.repeat(entry.exercise)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated with ❤️ by Your Wellness Companion</p>
          <p>Keep tracking your journey to better health!</p>
        </div>
      </body>
      </html>
    `);

    pdfWindow.document.close();
    
    // Wait for content to load then print as PDF
    setTimeout(() => {
      pdfWindow.print();
    }, 500);
  }

  function getPDFInsight(avgMood, avgEnergy, avgSleep, avgExercise) {
    const insights = [
      "Consistent tracking is the first step toward meaningful change! Your dedication is inspiring.",
      "Your balanced scores show good self-awareness. Consider setting one small wellness goal for next week.",
      "Wellness is a journey, not a destination. Each entry brings valuable insights for your growth.",
      "Your data shows patterns that can help optimize your daily routines for better wellbeing.",
      "Remember that small, consistent improvements lead to significant long-term benefits. Keep going!"
    ];
    
    // Custom insights based on data
    if (avgMood < 2.5) {
      return "Your mood scores suggest some challenges. Consider incorporating more activities you enjoy and reaching out for support when needed.";
    }
    if (avgEnergy < 2.5) {
      return "Lower energy levels might benefit from improved sleep routines and regular light exercise.";
    }
    if (avgSleep < 3) {
      return "Sleep quality is foundational to wellness. A consistent bedtime routine could make a big difference.";
    }
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  function handleTrends() {
    if (healthData.entries.length === 0) {
      showNotification('Track your wellness for a few days to see trends! 📈', 'info');
      return;
    }

    const recentEntries = healthData.entries.slice(-7);
    const moodTrend = calculateTrend(recentEntries, 'mood');
    const energyTrend = calculateTrend(recentEntries, 'energy');
    
    const message = `Your weekly trends:\n\n📊 Mood: ${moodTrend}\n⚡ Energy: ${energyTrend}\n\nKeep up the great work! ${getTrendEmoji(moodTrend)}`;
    
    showNotification(message, 'info', 6000);
  }

  function handleInsights() {
    const latestEntry = healthData.entries[healthData.entries.length - 1];
    
    if (!latestEntry) {
      showNotification('Submit your first check-in to get personalized insights! 💡', 'info');
      return;
    }

    const prompt = `Based on my recent wellness data: Mood ${latestEntry.mood}/5, Energy ${latestEntry.energy}/5, Sleep ${latestEntry.sleep}/5, Exercise ${latestEntry.exercise}/5. Give me one specific, actionable insight to improve my wellness today.`;
    
    userInput.value = prompt;
    handleChat();
  }

  function handleReminder() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showNotification('Daily reminders enabled! You will get notified to check in. 🔔', 'success');
          scheduleReminder();
        }
      });
    } else if (Notification.permission === 'granted') {
      scheduleReminder();
      showNotification('Reminder set for tomorrow! 🌅', 'success');
    } else {
      showNotification('Please enable notifications in your browser settings to get reminders. 📱', 'info');
    }
  }

  function handleCommunity() {
    const tips = [
      "Many people find morning sunlight helps regulate mood and energy! ☀️",
      "Community tip: 5-minute meditation breaks can significantly reduce stress! 🧘",
      "Others report better sleep with consistent bedtime routines! 🌙",
      "Walking meetings boost both physical activity and creativity! 🚶💡",
      "Hydration reminder: Many forget to drink water during busy days! 💧"
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    showNotification(`Community Wisdom:\n\n${randomTip}`, 'info', 5000);
  }

  function handleEmergency() {
    const resources = [
      "🆘 Crisis Text Line: Text HOME to 741741",
      "🆘 National Suicide Prevention Lifeline: 1-800-273-8255",
      "🆘 Emergency: 911",
      "💙 You are not alone. Reach out for help.",
      "🌱 Breathe deeply. This moment will pass."
    ];
    
    const randomResource = resources[Math.floor(Math.random() * resources.length)];
    showNotification(`Support Resources:\n\n${randomResource}\n\nYou matter. Help is available.`, 'emergency', 8000);
    
    // Also ask AI for immediate support
    userInput.value = "I need immediate emotional support and coping strategies";
    handleChat();
  }

  // Utility Functions
  function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message.replace(/\n/g, '<br>')}</span>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${getNotificationColor(type)};
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 400px;
      animation: slideInRight 0.3s ease;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  function getNotificationIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle',
      emergency: 'life-ring'
    };
    return icons[type] || 'info-circle';
  }

  function getNotificationColor(type) {
    const colors = {
      success: 'linear-gradient(135deg, #4cc9f0, #4361ee)',
      error: 'linear-gradient(135deg, #f94144, #e63946)',
      warning: 'linear-gradient(135deg, #f9c74f, #ff9e00)',
      info: 'linear-gradient(135deg, #7209b7, #3a0ca3)',
      emergency: 'linear-gradient(135deg, #e63946, #d00000)'
    };
    return colors[type] || colors.info;
  }

  function calculateTrend(entries, metric) {
    if (entries.length < 2) return 'Insufficient data';
    
    const first = entries[0][metric];
    const last = entries[entries.length - 1][metric];
    const change = ((last - first) / first * 100).toFixed(1);
    
    if (change > 0) return `Up ${change}% 📈`;
    if (change < 0) return `Down ${Math.abs(change)}% 📉`;
    return `Stable ↔️`;
  }

  function getTrendEmoji(trend) {
    return trend.includes('Up') ? '🚀' : trend.includes('Down') ? '💪' : '⚖️';
  }

  function scheduleReminder() {
    // Simple reminder - in a real app, you'd use more robust scheduling
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
    
    const delay = tomorrow - now;
    
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('🌅 Daily Wellness Check-in', {
          body: 'Time for your daily health check-in! How are you feeling today?',
          icon: '/icons/icon-192.png'
        });
      }
    }, delay);
  }

  function createConfetti() {
    const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#4cc9f0', '#f94144'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 2 + 's';
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }
  }

  function loadMotivation() {
    const motivations = [
      "Your wellness journey is unique and worth celebrating every day!",
      "Small steps every day lead to big changes over time. Keep going!",
      "You are capable of amazing things. Start with believing in yourself!",
      "Progress, not perfection. Every step forward counts!",
      "Your mental health is just as important as your physical health. Nurture both!"
    ];
    
    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    document.getElementById('daily-motivation').textContent = randomMotivation;
  }

  async function getDailyInsight(entry) {
    const prompt = `I just logged my daily health: Mood ${entry.mood}/5, Energy ${entry.energy}/5, Sleep ${entry.sleep}/5, Exercise ${entry.exercise}/5. Give me one quick, specific insight or suggestion based on this data. Keep it under 2 sentences.`;
    
    try {
      const res = await fetch("http://127.0.0.1:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      showNotification(`Daily Insight: ${data.reply}`, 'info', 5000);
    } catch (error) {
      console.error('Error getting insight:', error);
    }
  }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .notification-content i {
    font-size: 1.2rem;
  }
`;
document.head.appendChild(style);