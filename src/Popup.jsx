import React, { useState } from "react";
// import axios from "axios";

const Popup = () => {
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const CHUNK_SIZE = 1000;

    function splitTextIntoChunks(text, chunkSize) {
        const words = text.split(/\s+/);
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        return chunks;
    }
    
    const handleSummarize = async () => {
        if (!text || text.trim().length < 20) {
            setSummary("Please provide a longer text to summarize.");
            return;
        }
        setLoading(true);
        setSummary("");
        try {
            const chunks = splitTextIntoChunks(text, CHUNK_SIZE);
            let summaries = [];
            for (const chunk of chunks) {
                const response = await fetch("http://localhost:3001/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: chunk }),
                });
                const data = await response.json();
                if (Array.isArray(data) && data[0]?.summary_text) {
                    summaries.push(data[0].summary_text);
                } else if (data.summary_text) {
                    summaries.push(data.summary_text);
                } else if (data.error) {
                    setSummary("Error: " + data.error);
                    setLoading(false);
                    return;
                }
            }
            
            let finalSummary = summaries.join(" ");
            if (summaries.length > 1) {
                const response = await fetch("http://localhost:3001/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: finalSummary }),
                });
                const data = await response.json();
                if (Array.isArray(data) && data[0]?.summary_text) {
                    finalSummary = data[0].summary_text;
                } else if (data.summary_text) {
                    finalSummary = data.summary_text;
                }
            }
            setSummary(finalSummary);
        } catch (error) {
            setSummary("Error summarizing text.");
            console.error(error);
        }
        setLoading(false);
    };

    return(
        <div>
            <h1>Summarize T&C</h1>
            <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="Paste Terms & Conditions or Cookies text here..."
            rows={10}
            cols={40}
            />
            <button onClick={handleSummarize} disabled={loading}>
                {loading ? "Summarizing..." : "Summarize"}
            </button>
            <div>
                <h3>Summary:</h3>
                <p>{summary}</p>
            </div>
        </div>
    );
};

export default Popup