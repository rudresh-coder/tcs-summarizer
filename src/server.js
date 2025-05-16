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
  let min_length = 20, max_length = 100;
  if (length === "short") { min_length = 10; max_length = 40; }
  if (length === "long") { min_length = 100; max_length = 300; }
  if (!text || typeof text !== 'string' || text.trim().length < 20) {
    return res.status(400).json({ error: 'Input text is too short or invalid.' });
  }
  try {
    console.log('Text to summarize:', text);
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