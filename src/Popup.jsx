import React, { useState, useEffect } from "react";

const Popup = () => {
    const [screen, setScreen] = useState("splash");
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [summaryLength, setSummaryLength] = useState("");

    useEffect(() => {
        if (screen === "splash") {
            const timer = setTimeout(() => setScreen("input"), 3500);
            return () => clearTimeout(timer);
        }
    }, [screen]);

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const CHUNK_SIZE = 800;

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
            setScreen("result");
            return;
        }
        if (!summaryLength) {
            setSummary("Please select a summary size.");
            setScreen("result");
            return;
        }
        setSummary("");
        setScreen("loading")
        try {
            const chunks = splitTextIntoChunks(text, CHUNK_SIZE);
            let summaries = [];
            for (const chunk of chunks) {
                const response = await fetch("https://tcs-summarizer-backend.onrender.com/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: chunk, length: summaryLength }),
                });
                const data = await response.json();
                if (data.summary_text) {
                    summaries.push(data.summary_text);
                } else if (data.error) {
                    setSummary("Error: " + data.error);
                    setScreen("result");
                    return;
                }
            }
            
            let finalSummary = summaries.join(" ");
            if (summaries.length > 1) {
                const response = await fetch("https://tcs-summarizer-backend.onrender.com/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: finalSummary, length: summaryLength }),
                });
                const data = await response.json();
                if (data.summary_text) {
                    finalSummary = data.summary_text;
                }
            }
            setSummary(finalSummary);
        } catch (error) {
            setSummary("Error summarizing text.");
            console.error(error);
        }
        setScreen("result");
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(summary);
    };

    return(
        <div className="popup-container">
            {screen === "splash" && (
                <div className="splash-screen">
                    <img src="/images/splash_icon.png" alt="Extension Icon" className="splash-logo" style={{width: 300, height: 300, marginBottom: 16 }} />
                    <p className="loading-text">Loading Summarizer...</p>
                </div>
            )}

            {screen === "input" && (
                <div className="input-screen" style={{ width: "100%" }}>
                    <img src="/images/main_text_no_bg1.png" alt="Text Summarizer"  style={{ width: 280, height: "auto", display: "block", margin: "0 auto 12px auto" }} />
                    <textarea
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Paste Terms & Conditions or Cookies text here..."
                    rows={10}
                    cols={40}
                    />
                    <select value={summaryLength} onChange={e => setSummaryLength(e.target.value)} required >
                        <option value="" disabled>Select summary size</option>
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                    </select>
                    <button onClick={handleSummarize}>Summarize</button>
                </div>
            )}

            {screen === "loading" && (
                <div className="loading-screen">
                    <p>Summarizing your content...</p>
                    <div className="spinner"/>
                </div>
            )}

            {screen === "result" && (
                <div className="result-screen" style={{ width: "100%" }}>
                    <h3>Summary:</h3>
                    <textarea readOnly value={summary} rows={10} style={{width: "100%", marginBottom: 12 }} />
                    <button onClick={copyToClipboard} disabled={!summary}>
                        Copy Summary
                    </button>
                    <button onClick={() => { setText(""); setSummary(""); setScreen("input"); }}>
                        Summarize Another
                    </button>
                </div>
            )}
        </div>
    );
};

export default Popup;