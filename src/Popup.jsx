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

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const CHUNK_SIZE = 800;

    const splitTextIntoChunks = (text, chunkSize = 800, overlap = 100) => {
        const words = text.split(/\s+/);
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize - overlap) {
            chunks.push(words.slice(i, i + chunkSize).join(' '));
        }
        return chunks;
    };
    
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
                const prompt = "Summarize the following text, covering all key points and important details do not miss any important detail and dont make any mistakes:\n\n" + chunk;
                const payload = { text: prompt, length: summaryLength };
                const response = await fetch("https://tcs-summarizer-backend.onrender.com/summarize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
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
        <>
            {screen !== "splash" && (
                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: "fixed",
                        top: 18,
                        left: 4,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        zIndex: 1002,
                        padding: 0,
                    }}
                    aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                        <rect y="4" width="24" height="2" rx="1" fill="#5FA8D3"/>
                        <rect y="11" width="24" height="2" rx="1" fill="#5FA8D3"/>
                        <rect y="18" width="24" height="2" rx="1" fill="#5FA8D3"/>
                    </svg>
                </button>
            )}
            <div className="popup-container">
                {screen === "rules" && (
                <div className="usage-rules" style={{ width: "100%" }}>
                    <strong>Usage Rules:</strong>
                    <ul>
                    <li>
                        <strong>For best results, use clear, well-formatted text:</strong>
                        <ul style={{ marginTop: 4 }}>
                        <li>Paste text with proper paragraphs, bullet points, or numbered lists.</li>
                        <li>Avoid excessive line breaks, strange symbols, or formatting errors.</li>
                        <li>Remove unrelated content, ads, or navigation menus before summarizing.</li>
                        <li>Use English and check for spelling mistakes for the most accurate summary.</li>
                        <li>Prefer official or original documents over copied/edited versions.</li>
                        </ul>
                    </li>
                    <li>Paste only English text (Terms, Policies, etc.) for best results.</li>
                    <li>Do not submit confidential or sensitive information.</li>
                    <li>Summaries are generated by AI and may not be 100% accurate.</li>
                    <li>For very long texts, the summary may be shorter than expected.</li>
                    <li>Choose a summary size before clicking "Summarize".</li>
                    <li>Do not spam requests; you are limited to 50 summaries per day.</li>
                    <li>Use the summary for informational purposes only, not as legal advice.</li>
                    </ul>
                    <button
                    style={{
                        marginTop: 16,
                        background: "#5FA8D3",
                        color: "#1E2A38",
                        border: "none",
                        borderRadius: 8,
                        padding: "0.6em 1.2em",
                        cursor: "pointer"
                    }}
                    onClick={() => setScreen("input")}
                    >
                    Back
                    </button>
                </div>
                )}

                {sidebarOpen && (
                <>
                    <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(30,42,56,0.7)",
                        zIndex: 1000
                    }}
                    onClick={() => setSidebarOpen(false)}
                    />
                    <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: 240,
                        height: "100vh",
                        background: "#222F3E",
                        boxShadow: "2px 0 12px rgba(33,52,72,0.18)",
                        zIndex: 1001,
                        display: "flex",
                        flexDirection: "column",
                        padding: "2em 1em 1em 1.5em"
                    }}
                    >
                        
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(false)}
                            style={{
                            position: "absolute",
                            top: 18,
                            left: 4,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            zIndex: 1002,
                            padding: 0,
                            }}
                            aria-label="Close sidebar"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                            <rect y="4" width="24" height="2" rx="1" fill="#5FA8D3"/>
                            <rect y="11" width="24" height="2" rx="1" fill="#5FA8D3"/>
                            <rect y="18" width="24" height="2" rx="1" fill="#5FA8D3"/>
                            </svg>
                        </button>

                        <div className="sidebar-group" style={{marginTop: "48px"}}>
                            <button
                                className="sidebar-item"
                                onClick={() => {
                                    setScreen("rules");
                                    setSidebarOpen(false);
                                }}
                            >
                                Usage Rules
                            </button>
                            <button
                                className="sidebar-item"
                                onClick={() => {
                                    setScreen("about");
                                    setSidebarOpen(false);
                                }}
                            >
                                About
                            </button>
                            <a
                                href="mailto:tcs.summarizer@gmail.com?subject=Text Summarizer Feedback"
                                className="sidebar-item"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Send Feedback
                            </a>
                        </div>    
                    </div>
                </>
                )}

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

                {screen === "about" && (
                    <div className="about-screen" style={{ width: "100%" }}>
                        <div className="usage-rules">
                        <h3>About the Extension</h3>
                        <p>This extension uses AI to summarize long texts, making it easier to understand key points quickly.</p>
                        <p>It is powered by the Hugging Face Transformers library and the BART model.</p>
                        <p>Developed and maintained by Rudresh Naidu.</p>
                        <button
                            style={{
                                marginTop: 16,
                                background: "#5FA8D3",
                                color: "#1E2A38",
                                border: "none",
                                borderRadius: 8,
                                padding: "0.6em 1.2em",
                                cursor: "pointer"
                            }}
                            onClick={() => setScreen("input")}
                        >
                            Back
                        </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Popup;