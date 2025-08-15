import { useState } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import 'prismjs/components/prism-python';
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'

function App() {
  const [code, setCode] = useState(
`def get_active_users(users):
    results = []
    for u in users:
        if u.is_active == True and u.profile_complete == True:
            results.append(u)
    return results`
  );
  const [comments, setComments] = useState(
`This is inefficient. Don't loop twice conceptually.
Variable 'u' is a bad name.
Boolean comparison '== True' is redundant.`
  );
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  async function reviewCode() {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3002/ai/get-response', {
        code_snippet: code,
        review_comments: comments
          .split('\n')
          .map(c => c.trim())
          .filter(Boolean)
      });
      setReview(response.data.response);
    } catch (err) {
      setReview('Error fetching review');
    }
    setLoading(false);
  }

  return (
    <>
      <main>
        <div className="left">
          <h3>Paste your code</h3>
          <Editor
            value={code}
            onValueChange={setCode}
            highlight={code => prism.highlight(code, prism.languages.python, "python")}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 16,
              border: "1px solid #ddd",
              borderRadius: "5px",
              height: "400px",
              maxWidth: "100%",
              marginBottom: "10px",
              overflow: "auto",
            }}
          />
          <h3>Paste direct review comments (one per line)</h3>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={6}
            style={{
              fontSize: 15,
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "5px",
              marginBottom: "10px"
            }}
            placeholder="Enter review comments, each on a new line"
          />
          <br />
          <button onClick={reviewCode} className="review" disabled={loading}>
            {loading ? 'Reviewing...' : 'Review'}
          </button>
        </div>
        <div className="right">
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {review}
          </Markdown>
        </div>
      </main>
    </>
  )
}

export default App;
