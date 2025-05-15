function extractTermsAndConditions() {
    return document.body.innerText;
  }
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractTandC") {
      const text = extractTermsAndConditions();
      sendResponse({ data: text });
    }
  });