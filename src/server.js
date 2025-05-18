import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;

if (!HUGGINGFACE_API_KEY) {
  console.warn('Warning: Hugging Face API key is not set!');
}

app.post('/summarize', async (req, res) => {
  const { text, length } = req.body;
  const wordCount = text.trim().split(/\s+/).length;
  let min_length, max_length;

  if (length === "short") {
    min_length = Math.max(10, Math.floor(wordCount * 0.05));
    max_length = Math.max(40, Math.floor(wordCount * 0.10));
  } else if (length === "long") {
    min_length = Math.max(100, Math.floor(wordCount * 0.20));
    max_length = Math.max(300, Math.floor(wordCount * 0.25));
  } else { // medium
    min_length = Math.max(20, Math.floor(wordCount * 0.15));
    max_length = Math.max(100, Math.floor(wordCount * 0.20));
  }

  const MODEL_MAX_TOKENS = 1024;
  max_length = Math.min(max_length, MODEL_MAX_TOKENS);
  min_length = Math.min(min_length, max_length - 1); 

  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return res.status(400).json({ error: 'Input text is too short or invalid.' });
  }
  try {
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text, parameters: { min_length, max_length } },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );
    const summary = Array.isArray(hfResponse.data) && hfResponse.data[0]?.summary_text
      ? hfResponse.data[0].summary_text
      : hfResponse.data.summary_text || 'No summary returned';
    res.json({ summary_text: summary }); // <-- return as object, not array
  } catch (err) {
    console.error('Summarization error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

app.get('/healthz', (req, res) => res.send('OK'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on port ${PORT}`);
});