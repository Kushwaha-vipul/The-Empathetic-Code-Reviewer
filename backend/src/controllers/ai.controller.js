const aiService = require("../services/ai.service");

module.exports.getResponse = async (req, res) => {
  try {
    const { code_snippet, review_comments } = req.body;
    if (!code_snippet || !Array.isArray(review_comments)) {
      return res.status(400).json({ error: "code_snippet and review_comments[] required" });
    }

    // Build explicit prompt with complete instructions:
    const prompt = `
You are an empathetic senior developer and mentor.
Given the following code and review comments, for EACH comment:
1. Give a gentle, positive rephrasing of the feedback.
2. Clearly explain WHY (the underlying principle) behind the suggestion.
3. Show a suggested improvement with code example (using triple backticks).
4. If possible, add a link to relevant documentation (such as PEP8 for Python, MDN for JS, docs on variable naming, or efficiency).
5. Format your output in Markdown, with a section for each comment as shown below.
6. Conclude with an encouraging summary paragraph for the developer.

Code:
\`\`\`
${code_snippet}
\`\`\`

Review Comments:
${review_comments.map((c, i) => `${i+1}. ${c}`).join('\n')}

Output should look like:

---
### Analysis of Comment: "First comment here"
* Positive Rephrasing: ...
* The 'Why': ...
* Suggested Improvement:
\`\`\`yourlang
...
\`\`\`
* Resource Link: [Some Doc](doc-url-if-available)
---

(repeat for each comment above)

At the end, include a holistic summary of the feedback.
`;

    const reviewText = await aiService.getAIResponse(prompt);
    res.status(200).json({ response: reviewText });
  } catch (error) {
    console.error("AI Controller Error:", error.message);
    if (error.message.includes("overloaded")) {
      return res.status(503).json({ error: " Please try again in a moment." });
    }
    if (error.message.includes("unavailable")) {
      return res.status(503).json({ error: " Please try again later." });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
