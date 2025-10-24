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

  // Premium State Management
  let healthData = JSON.parse(localStorage.getItem('healthData')) || {
    entries: [],
    streak: 0,
    lastEntry: null,
    insights: [],
    goals: []
  };

  // Conversation history for context
  let conversationHistory = [];

  // Initialize the premium app
  initApp();

  // Enhanced Event Listeners
  askBtn.addEventListener("click", handlePremiumChat);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePremiumChat();
    }
  });

  // Add input animation
  userInput.addEventListener('focus', () => {
    userInput.parentElement.style.transform = 'scale(1.02)';
  });

  userInput.addEventListener('blur', () => {
    userInput.parentElement.style.transform = 'scale(1)';
  });

  submitBtn.addEventListener("click", handlePremiumSubmit);
  exportBtn.addEventListener("click", handlePremiumExport);
  trendsBtn.addEventListener("click", handlePremiumTrends);
  insightsBtn.addEventListener("click", handlePremiumInsights);
  remindBtn.addEventListener("click", handlePremiumReminder);
  communityBtn.addEventListener("click", handlePremiumCommunity);
  emergencyBtn.addEventListener("click", handlePremiumEmergency);

  quickBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      userInput.value = e.target.dataset.prompt;
      handlePremiumChat();
    });
  });

  // Enhanced Trackers with real-time feedback
  setupPremiumTrackerFeedback();

  // Premium Functions
  function initApp() {
    updatePremiumStats();
    updatePremiumDate();
    updatePremiumStreak();
    loadPremiumMotivation();
    initializePremiumAnimations();
  }

  function initializePremiumAnimations() {
    // Add staggered animations for cards
    const cards = document.querySelectorAll('.tracker-card, .stat-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }

  function updatePremiumDate() {
    const today = new Date();
    document.getElementById('today-date').textContent = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function updatePremiumStreak() {
    const today = new Date().toDateString();
    const lastEntry = healthData.lastEntry;
    
    if (lastEntry === today) return;
    
    if (lastEntry) {
      const lastDate = new Date(lastEntry);
      const todayDate = new Date();
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        healthData.streak++;
        showPremiumNotification(`🔥 Streak continues! Day ${healthData.streak}`, 'success');
      } else if (diffDays > 1) {
        healthData.streak = 1;
        showPremiumNotification('🔄 New streak started!', 'info');
      }
    } else {
      healthData.streak = 1;
    }
    
    document.getElementById('checkin-streak').textContent = healthData.streak;
    localStorage.setItem('healthData', JSON.stringify(healthData));
  }

  function updatePremiumStats() {
    if (healthData.entries.length === 0) {
      document.getElementById('avg-mood').textContent = '0.0';
      document.getElementById('avg-energy').textContent = '0.0';
      return;
    }

    const recentEntries = healthData.entries.slice(-30); // Last 30 days
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood, 0) / recentEntries.length;
    const avgEnergy = recentEntries.reduce((sum, entry) => sum + entry.energy, 0) / recentEntries.length;

    document.getElementById('avg-mood').textContent = avgMood.toFixed(1);
    document.getElementById('avg-energy').textContent = avgEnergy.toFixed(1);

    // Add trend indicators
    updateTrendIndicators();
  }

  function updateTrendIndicators() {
    // Implementation for trend arrows
    const moodElement = document.getElementById('avg-mood');
    const energyElement = document.getElementById('avg-energy');
    
    // Simple trend calculation (comparing last 7 vs previous 7 days)
    if (healthData.entries.length >= 14) {
      const recentMood = healthData.entries.slice(-7).reduce((sum, entry) => sum + entry.mood, 0) / 7;
      const previousMood = healthData.entries.slice(-14, -7).reduce((sum, entry) => sum + entry.mood, 0) / 7;
      
      moodElement.innerHTML = `${moodElement.textContent} ${recentMood > previousMood ? '📈' : recentMood < previousMood ? '📉' : '➡️'}`;
    }
  }

  function setupPremiumTrackerFeedback() {
    const trackers = ['mood', 'energy', 'sleep', 'exercise'];
    
    trackers.forEach(tracker => {
      const slider = document.getElementById(tracker);
      const feedback = document.getElementById(`${tracker}-feedback`);
      
      slider.addEventListener('input', () => {
        const value = parseInt(slider.value);
        feedback.textContent = getPremiumTrackerFeedback(tracker, value);
        feedback.style.color = getPremiumTrackerColor(value);
        
        // Add visual feedback
        slider.style.background = getPremiumTrackerGradient(value);
      });
      
      // Set initial state
      const initialValue = parseInt(slider.value);
      feedback.textContent = getPremiumTrackerFeedback(tracker, initialValue);
      feedback.style.color = getPremiumTrackerColor(initialValue);
      slider.style.background = getPremiumTrackerGradient(initialValue);
    });
  }

  function getPremiumTrackerFeedback(tracker, value) {
    const feedbacks = {
      mood: {
        1: "I understand this is a challenging day. Remember, every emotion is valid and temporary. 💙",
        2: "It's okay to have difficult moments. Small acts of self-care can make a big difference. 🌱",
        3: "A balanced day. Consider what small change could bring more joy to your routine. 🌈",
        4: "Wonderful! Your positive energy is shining through. Keep nurturing this mindset. ✨",
        5: "Absolutely radiant! Your positive outlook is inspiring. Share that light with others! 🌟"
      },
      energy: {
        1: "Deep rest is important. Listen to your body's need for recovery today. 🛌",
        2: "Gentle movement and hydration can help boost your energy levels naturally. 🚶‍♀️",
        3: "Steady energy provides a great foundation for balanced productivity. ⚡",
        4: "Excellent vitality! Channel this energy into meaningful activities. 🚀",
        5: "Peak performance! Your vibrant energy is perfect for tackling important goals. 🌞"
      },
      sleep: {
        1: "Quality rest is essential. Consider a digital detox before bedtime tonight. 🌙",
        2: "Your body may need more recovery. A consistent bedtime routine can help. 💤",
        3: "Maintaining good sleep habits is key to sustained wellness. 🛌",
        4: "Restorative sleep! Your body and mind are thanking you for this care. 😴",
        5: "Optimal restoration! This quality sleep supports all aspects of your health. ⭐"
      },
      exercise: {
        1: "Every movement counts. Even gentle stretching supports circulation. 🛋️",
        2: "Light activity builds foundation. Consider a brief walk to invigorate your day. 🚶‍♀️",
        3: "Consistent movement creates lasting health benefits. Well done! 🏃‍♀️",
        4: "Active lifestyle! Your commitment to movement is supporting overall wellness. 🏋️‍♀️",
        5: "Peak activity! Your dedication to fitness is building resilience and vitality. 🦸‍♀️"
      }
    };
    
    return feedbacks[tracker][value] || "Your consistent tracking shows great self-awareness. Continue honoring your journey.";
  }

  function getPremiumTrackerColor(value) {
    const colors = {
      1: '#e63946', // Vibrant Red
      2: '#f4a261', // Warm Orange
      3: '#2a9d8f', // Teal
      4: '#4361ee', // Royal Blue
      5: '#7209b7'  // Deep Purple
    };
    return colors[value] || '#4361ee';
  }

  function getPremiumTrackerGradient(value) {
    const gradients = {
      1: 'linear-gradient(to right, #e63946, #f4a261)',
      2: 'linear-gradient(to right, #f4a261, #e9c46a)',
      3: 'linear-gradient(to right, #e9c46a, #2a9d8f)',
      4: 'linear-gradient(to right, #2a9d8f, #4361ee)',
      5: 'linear-gradient(to right, #4361ee, #7209b7)'
    };
    return gradients[value] || 'linear-gradient(to right, #4361ee, #7209b7)';
  }

  // Premium Typewriter Effect with Enhanced Features
  function premiumTypewriterEffect(element, text, speed = 25) {
    return new Promise((resolve) => {
      element.innerHTML = '';
      element.classList.add('typewriter-text');
      
      let i = 0;
      let htmlBuffer = '';
      let insideTag = false;
      let tagBuffer = '';
      
      const timer = setInterval(() => {
        if (i < text.length) {
          const char = text[i];
          
          if (char === '<') {
            insideTag = true;
            tagBuffer = char;
          } else if (char === '>' && insideTag) {
            tagBuffer += char;
            htmlBuffer += tagBuffer;
            element.innerHTML = htmlBuffer;
            insideTag = false;
            tagBuffer = '';
          } else if (insideTag) {
            tagBuffer += char;
          } else {
            htmlBuffer += char;
            element.innerHTML = htmlBuffer + '<span class="typewriter-cursor">|</span>';
          }
          
          i++;
        } else {
          clearInterval(timer);
          element.classList.remove('typewriter-text');
          element.innerHTML = htmlBuffer; // Remove cursor
          resolve();
        }
      }, speed);
    });
  }

  // Premium Typing Indicator
  function showPremiumTypingIndicator() {
    aiResponse.innerHTML = `
      <div class="typing-indicator">
        <div class="response-avatar">M</div>
        <span>Martins AI is thinking</span>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
  }

  // Premium Chat Handler
  async function handlePremiumChat() {
    const message = userInput.value.trim();
    if (!message) {
      showPremiumNotification('Please enter your wellness question to continue.', 'info');
      return;
    }

    // Add to conversation history
    conversationHistory.push({ role: 'user', content: message });
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10); // Keep last 10 messages
    }

    showPremiumTypingIndicator();
    userInput.value = "";
    userInput.disabled = true;
    askBtn.disabled = true;

    try {
      const startTime = Date.now();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      const responseTime = Date.now() - startTime;

      // Add AI response to history
      conversationHistory.push({ role: 'assistant', content: data.reply });

      // Create premium response container
      aiResponse.innerHTML = `
        <div class="ai-response-premium">
          <div class="response-header">
            <div class="response-avatar">M</div>
            <strong>Martins AI</strong>
            <span style="color: #666; font-size: 0.9rem; margin-left: auto;">${Math.round(responseTime/1000)}s</span>
          </div>
          <div class="response-content" id="response-content"></div>
        </div>
      `;

      const responseContent = document.getElementById('response-content');
      await premiumTypewriterEffect(responseContent, data.reply, 20);
      
      // Log successful interaction
      console.log('✅ Premium chat completed:', { responseTime, messageLength: message.length });

    } catch (error) {
      console.error('💥 Premium chat error:', error);
      
      aiResponse.innerHTML = `
        <div class="ai-response-premium" style="border-left-color: #e63946;">
          <div class="response-header">
            <div class="response-avatar" style="background: linear-gradient(135deg, #e63946, #d00000);">!</div>
            <strong>System Notice</strong>
          </div>
          <div class="response-content">
            <p>I apologize for the interruption. There seems to be a temporary connection issue.</p>
            <p><strong>Please try again in a moment.</strong> Your wellness journey is important to me.</p>
          </div>
        </div>
      `;
    } finally {
      userInput.disabled = false;
      askBtn.disabled = false;
      userInput.focus();
    }
  }

  // Enhanced Submit Handler
  function handlePremiumSubmit() {
    const today = new Date().toDateString();
    
    if (healthData.lastEntry === today) {
      showPremiumNotification('Your daily check-in is already complete! Return tomorrow to continue your streak. 🌟', 'info');
      return;
    }

    const entry = {
      date: today,
      mood: parseInt(document.getElementById('mood').value),
      energy: parseInt(document.getElementById('energy').value),
      sleep: parseInt(document.getElementById('sleep').value),
      exercise: parseInt(document.getElementById('exercise').value),
      timestamp: new Date().toISOString(),
      notes: generateDailyNotes()
    };

    healthData.entries.push(entry);
    healthData.lastEntry = today;
    healthData.streak = healthData.streak + 1;

    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    updatePremiumStats();
    showPremiumNotification('🎉 Daily check-in completed successfully! Your consistency is building lasting wellness habits.', 'success');
    createPremiumConfetti();
    
    // Get AI insight
    getPremiumDailyInsight(entry);
  }

  function generateDailyNotes() {
    const mood = parseInt(document.getElementById('mood').value);
    const energy = parseInt(document.getElementById('energy').value);
    
    if (mood <= 2 && energy <= 2) {
      return "Low mood and energy - consider gentle self-care activities";
    } else if (mood >= 4 && energy >= 4) {
      return "High vitality day - perfect for productivity and social connection";
    }
    return "Balanced day with room for optimization";
  }

  // Premium Export Handler
  function handlePremiumExport() {
    if (healthData.entries.length === 0) {
      showPremiumNotification('Begin your wellness journey by tracking a few days to generate meaningful reports. 📊', 'info');
      return;
    }

    generatePremiumPDFReport();
    showPremiumNotification('📄 Your professional wellness report is being generated...', 'success');
  }

  function generatePremiumPDFReport() {
    const pdfWindow = window.open('', '_blank');
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate comprehensive statistics
    const totalEntries = healthData.entries.length;
    const avgMood = (healthData.entries.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries).toFixed(1);
    const avgEnergy = (healthData.entries.reduce((sum, entry) => sum + entry.energy, 0) / totalEntries).toFixed(1);
    const avgSleep = (healthData.entries.reduce((sum, entry) => sum + entry.sleep, 0) / totalEntries).toFixed(1);
    const avgExercise = (healthData.entries.reduce((sum, entry) => sum + entry.exercise, 0) / totalEntries).toFixed(1);

    // Get trends
    const recentEntries = healthData.entries.slice(-7);
    const moodTrend = calculatePremiumTrend(recentEntries, 'mood');
    const energyTrend = calculatePremiumTrend(recentEntries, 'energy');

    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Martins AI Wellness Report</title>
        <style>
          body { 
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; 
            margin: 50px; 
            color: #2b2d42;
            line-height: 1.6;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          .header { 
            text-align: center; 
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #4361ee;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header h1 { 
            color: #4361ee; 
            margin-bottom: 15px;
            font-size: 2.5rem;
            font-weight: 700;
          }
          .summary { 
            background: white; 
            padding: 30px; 
            border-radius: 15px; 
            margin-bottom: 30px;
            border-left: 5px solid #4cc9f0;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          }
          .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 20px; 
            margin-bottom: 30px;
          }
          .stat-card { 
            background: white; 
            padding: 25px; 
            border-radius: 12px; 
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            text-align: center;
            border-top: 4px solid #7209b7;
          }
          .stat-value { 
            font-size: 2.2rem; 
            font-weight: 800; 
            color: #3a0ca3; 
            display: block;
          }
          .stat-label { 
            color: #666; 
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            border-radius: 10px;
            overflow: hidden;
          }
          th, td { 
            padding: 15px; 
            text-align: left; 
            border-bottom: 1px solid #e9ecef;
          }
          th { 
            background: #4361ee; 
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) { 
            background: #f8f9fa; 
          }
          .trends { 
            background: white; 
            padding: 25px; 
            border-radius: 15px; 
            margin-bottom: 30px;
            border-left: 5px solid #f9c74f;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
          }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            color: #666; 
            font-size: 0.9rem;
            border-top: 1px solid #dee2e6;
            padding-top: 20px;
          }
          .emoji { 
            font-size: 1.2rem; 
            margin-right: 8px;
          }
          .insight { 
            background: #fff3cd; 
            padding: 25px; 
            border-radius: 12px; 
            margin: 25px 0;
            border-left: 5px solid #ffc107;
          }
          .badge {
            background: #4361ee;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌿 Martins AI Wellness Report</h1>
          <p style="font-size: 1.1rem; color: #666; margin-bottom: 10px;">Generated on ${today}</p>
          <p><span class="badge">${totalEntries} Entries Tracked</span> • <span class="badge">${healthData.streak} Day Streak</span></p>
        </div>
        
        <div class="summary">
          <h2 style="color: #3a0ca3; margin-bottom: 15px;">📊 Executive Summary</h2>
          <p style="font-size: 1.1rem;">Your wellness journey shows ${totalEntries >= 7 ? 'consistent tracking' : 'promising start'} with an average mood of ${avgMood}/5 and energy of ${avgEnergy}/5. ${getReportEncouragement(totalEntries, avgMood)}</p>
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
            <span class="stat-label">Sleep Quality</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${avgExercise}/5</span>
            <span class="stat-label">Activity Level</span>
          </div>
        </div>
        
        <div class="trends">
          <h2 style="color: #3a0ca3; margin-bottom: 15px;">📈 Recent Trends Analysis</h2>
          <p><span class="emoji">😊</span> <strong>Mood:</strong> ${moodTrend}</p>
          <p><span class="emoji">⚡</span> <strong>Energy:</strong> ${energyTrend}</p>
          ${getTrendInsights(moodTrend, energyTrend)}
        </div>
        
        <div class="insight">
          <h3 style="color: #856404; margin-bottom: 10px;">💡 Professional Insight</h3>
          <p style="font-size: 1.05rem;">${getPremiumPDFInsight(avgMood, avgEnergy, avgSleep, avgExercise)}</p>
        </div>
        
        <h2 style="color: #3a0ca3; margin-bottom: 20px;">📝 Detailed Wellness Log</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Mood</th>
              <th>Energy</th>
              <th>Sleep</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            ${healthData.entries.map(entry => `
              <tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${'⭐'.repeat(entry.mood)} ${entry.mood}/5</td>
                <td>${'⚡'.repeat(entry.energy)} ${entry.energy}/5</td>
                <td>${'😴'.repeat(entry.sleep)} ${entry.sleep}/5</td>
                <td>${'🏃'.repeat(entry.exercise)} ${entry.exercise}/5</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated with ❤️ by Martins AI Wellness Companion</p>
          <p>Your commitment to self-care is inspiring. Continue tracking for deeper insights!</p>
        </div>
      </body>
      </html>
    `);

    pdfWindow.document.close();
    
    setTimeout(() => {
      pdfWindow.print();
    }, 1000);
  }

  function getReportEncouragement(entries, avgMood) {
    if (entries < 3) return "Continue tracking to establish meaningful patterns.";
    if (avgMood >= 4) return "Your positive trend is excellent for overall wellbeing.";
    if (avgMood <= 2.5) return "Your awareness of these patterns is the first step toward positive change.";
    return "Your consistent tracking provides valuable insights for optimization.";
  }

  function getTrendInsights(moodTrend, energyTrend) {
    if (moodTrend.includes('Up') && energyTrend.includes('Up')) {
      return '<p style="color: #2a9d8f; margin-top: 10px;"><strong>Insight:</strong> Both mood and energy are improving - excellent synergy!</p>';
    }
    if (moodTrend.includes('Down') && energyTrend.includes('Down')) {
      return '<p style="color: #e63946; margin-top: 10px;"><strong>Insight:</strong> Consider focusing on foundational self-care and rest.</p>';
    }
    return '<p style="color: #666; margin-top: 10px;"><strong>Insight:</strong> Mixed trends suggest opportunities for routine optimization.</p>';
  }

  function getPremiumPDFInsight(avgMood, avgEnergy, avgSleep, avgExercise) {
    const insights = [
      "Your consistent tracking demonstrates excellent self-awareness, which is foundational for meaningful wellness progress.",
      "The data shows promising patterns. Consider setting one specific, measurable goal for the coming week.",
      "Wellness is a personal journey, and your dedication to tracking shows strong commitment to self-care.",
      "These insights provide a solid foundation for optimizing your daily routines and habits.",
      "Remember that sustainable change happens through small, consistent improvements over time."
    ];
    
    // Contextual insights
    if (avgMood < 2.5 && avgEnergy < 2.5) {
      return "Your patterns suggest benefit from focusing on foundational wellness: quality sleep, nutrition, and gentle movement can create positive momentum.";
    }
    if (avgSleep < 3) {
      return "Sleep quality appears to be an opportunity area. Consistent bedtime routines and sleep hygiene practices could significantly impact overall wellness.";
    }
    if (avgMood >= 4 && avgEnergy >= 4) {
      return "You're maintaining excellent vitality! Consider channeling this energy into establishing long-term wellness habits that will serve you during more challenging periods.";
    }
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  function calculatePremiumTrend(entries, metric) {
    if (entries.length < 2) return 'Insufficient data for trend analysis';
    
    const firstHalf = entries.slice(0, Math.floor(entries.length/2));
    const secondHalf = entries.slice(Math.floor(entries.length/2));
    
    const firstAvg = firstHalf.reduce((sum, entry) => sum + entry[metric], 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, entry) => sum + entry[metric], 0) / secondHalf.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg * 100).toFixed(1);
    
    if (change > 5) return `Significant improvement 📈 (+${change}%)`;
    if (change > 0) return `Gradual improvement ↗️ (+${change}%)`;
    if (change < -5) return `Notable decline 📉 (${change}%)`;
    if (change < 0) return `Slight decrease ↘️ (${change}%)`;
    return `Stable maintenance ↔️`;
  }

  // Enhanced button handlers
  function handlePremiumTrends() {
    if (healthData.entries.length < 3) {
      showPremiumNotification('Track at least 3 days to unlock personalized trend analysis. 📈', 'info');
      return;
    }

    const recentEntries = healthData.entries.slice(-7);
    const moodTrend = calculatePremiumTrend(recentEntries, 'mood');
    const energyTrend = calculatePremiumTrend(recentEntries, 'energy');
    
    const message = `📊 **Weekly Wellness Trends**\n\n**Mood Pattern:** ${moodTrend}\n**Energy Flow:** ${energyTrend}\n\n${getTrendRecommendation(moodTrend, energyTrend)}`;
    
    showPremiumNotification(message, 'info', 7000);
  }

  function getTrendRecommendation(moodTrend, energyTrend) {
    if (moodTrend.includes('improvement') && energyTrend.includes('improvement')) {
      return "💪 **Recommendation:** Your positive momentum is excellent! Consider setting stretch goals while maintaining self-care foundations.";
    }
    if (moodTrend.includes('decline') || energyTrend.includes('decline')) {
      return "🛌 **Recommendation:** Focus on restorative practices - quality sleep, nutrition, and gentle movement can help rebuild energy.";
    }
    return "⚖️ **Recommendation:** Maintain your current routines while exploring small optimizations for continued progress.";
  }

  function handlePremiumInsights() {
    const latestEntry = healthData.entries[healthData.entries.length - 1];
    
    if (!latestEntry) {
      showPremiumNotification('Complete your first check-in to receive personalized AI insights tailored to your wellness patterns. 💡', 'info');
      return;
    }

    const prompt = `Based on my current wellness metrics - Mood: ${latestEntry.mood}/5, Energy: ${latestEntry.energy}/5, Sleep: ${latestEntry.sleep}/5, Exercise: ${latestEntry.exercise}/5 - provide one specific, evidence-based recommendation to optimize my wellbeing today. Focus on practical implementation.`;
    
    userInput.value = prompt;
    handlePremiumChat();
  }

  function handlePremiumReminder() {
    if (!('Notification' in window)) {
      showPremiumNotification('Your browser doesn\'t support notifications. Consider using a modern browser for the best experience. 🌅', 'info');
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          showPremiumNotification('🔔 Daily wellness reminders activated! You\'ll receive gentle prompts to maintain your consistency.', 'success');
          schedulePremiumReminder();
        } else {
          showPremiumNotification('Notifications permission denied. You can enable them in browser settings to receive wellness reminders.', 'info');
        }
      });
    } else if (Notification.permission === 'granted') {
      schedulePremiumReminder();
      showPremiumNotification('🌅 Smart reminder scheduled! You\'ll be notified tomorrow for your daily check-in.', 'success');
    } else {
      showPremiumNotification('Please enable notifications in your browser settings to receive daily wellness reminders. 🔔', 'info');
    }
  }

  function schedulePremiumReminder() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const delay = tomorrow - now;
    
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('🌿 Martins AI Wellness Check-in', {
          body: 'Time for your daily wellness reflection! How are you feeling today?',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'daily-wellness-reminder',
          requireInteraction: true
        });
      }
    }, delay);
  }

  function handlePremiumCommunity() {
    const wisdom = [
      "Community insight: Morning sunlight exposure within 1 hour of waking significantly improves mood and circadian rhythm regulation! ☀️",
      "Many members find that 5-minute 'breathing breaks' throughout the day reduce stress by 30% on average. 🧘‍♀️",
      "The community reports that consistent sleep schedules improve energy levels more than extra hours of irregular sleep. 🌙",
      "Walking meetings are trending - they boost creativity by 60% while meeting activity goals! 🚶‍♀️💡",
      "Hydration tip: Many successful members use habit-tracking apps to meet daily water intake goals. 💧"
    ];
    
    const randomWisdom = wisdom[Math.floor(Math.random() * wisdom.length)];
    showPremiumNotification(`🌟 **Community Wisdom**\n\n${randomWisdom}`, 'info', 6000);
  }

  function handlePremiumEmergency() {
    const crisisResources = [
      "🆘 **Crisis Text Line**: Text HOME to 741741 (24/7 support)",
      "🆘 **National Suicide Prevention Lifeline**: 1-800-273-8255",
      "🆘 **Emergency Services**: Dial 911 for immediate assistance",
      "💙 **You are not alone**. Professional support is available 24/7.",
      "🌱 **Immediate grounding technique**: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, 1 thing you can taste."
    ];
    
    const randomResource = crisisResources[Math.floor(Math.random() * crisisResources.length)];
    showPremiumNotification(`🆘 **Crisis Support**\n\n${randomResource}\n\nYour wellbeing matters. Reach out - support is available.`, 'emergency', 10000);
    
    // Immediate AI support
    userInput.value = "I need immediate emotional support and crisis coping strategies";
    handlePremiumChat();
  }

  // Premium Notification System
  function showPremiumNotification(message, type = 'info', duration = 5000) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: '💡',
      emergency: '🆘'
    };

    notification.innerHTML = `
      <div class="notification-content">
        <span style="font-size: 1.3rem;">${icons[type] || '💡'}</span>
        <span>${message.replace(/\n/g, '<br>')}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 400);
    }, duration);
  }

  function createPremiumConfetti() {
    const colors = ['#4361ee', '#3a0ca3', '#7209b7', '#4cc9f0', '#f94144', '#ff9e00'];
    for (let i = 0; i < 75; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.width = Math.random() * 15 + 8 + 'px';
      confetti.style.height = Math.random() * 15 + 8 + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, 5000);
    }
  }

  function loadPremiumMotivation() {
    const motivations = [
      "Your wellness journey is as unique as you are. Every step forward, no matter how small, is worth celebrating. 🌟",
      "True wellness isn't about perfection—it's about showing up for yourself consistently, with compassion and curiosity. 💫",
      "You are capable of remarkable growth. Start by believing in your ability to create positive change, one day at a time. 🚀",
      "Progress over perfection. Every conscious choice you make for your wellbeing creates ripples of positive impact. 🌊",
      "Your mental and physical health are deeply connected. Nurturing both creates a foundation for lasting vitality. 🌿"
    ];
    
    const randomMotivation = motivations[Math.floor(Math.random() * motivations.length)];
    document.getElementById('daily-motivation').textContent = randomMotivation;
  }

  async function getPremiumDailyInsight(entry) {
    const prompt = `I just completed my daily wellness check-in with these metrics: Mood ${entry.mood}/5, Energy ${entry.energy}/5, Sleep ${entry.sleep}/5, Exercise ${entry.exercise}/5. Based on this specific combination, provide one concise, actionable insight or suggestion for today. Focus on practical implementation.`;
    
    try {
      const res = await fetch("http://127.0.0.1:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();
      showPremiumNotification(`💡 **Daily Insight**\n\n${data.reply}`, 'info', 6000);
    } catch (error) {
      console.error('Error getting premium insight:', error);
    }
  }
});

// Add enhanced notification styles
const premiumStyles = document.createElement('style');
premiumStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%) scale(0.8);
      opacity: 0;
    }
    to {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
    to {
      transform: translateX(100%) scale(0.8);
      opacity: 0;
    }
  }
  
  .typewriter-cursor {
    animation: blinkCaret 0.8s step-end infinite;
  }
`;
document.head.appendChild(premiumStyles);