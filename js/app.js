document.addEventListener("DOMContentLoaded", () => {
  const askBtn = document.getElementById("ask-btn");
  const userInput = document.getElementById("user-input");
  const aiResponse = document.getElementById("ai-response");

  askBtn.addEventListener("click", async () => {
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
    } catch (error) {
      console.error("Error:", error);
      aiResponse.textContent = "Oops! Something went wrong.";
    }
  });
});
