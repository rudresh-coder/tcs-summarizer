import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;

app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  try {
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      { inputs: text },
      { headers: { Authorization: `Bearer ${HUGGINGFACE_API_KEY}` } }
    );
    const summary = Array.isArray(hfResponse.data) && hfResponse.data[0]?.summary_text
      ? hfResponse.data[0].summary_text
      : hfResponse.data.summary_text || 'No summary returned';
    res.json({ summary });
  } catch (err) {
    console.error('Summarization error:', err.message);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on port ${PORT}`);
});