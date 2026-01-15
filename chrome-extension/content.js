// ColdIQ Chrome Extension - Content Script for Gmail
const API_URL = 'https://cold-email-ai-2.preview.emergentagent.com/api';

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get stored token
async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['coldiq_token'], (result) => {
      resolve(result.coldiq_token || null);
    });
  });
}

// Analyze email API call
async function analyzeEmail(subject, body, token) {
  const response = await fetch(`${API_URL}/analysis/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ subject, body })
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Analysis failed');
  }
  
  return response.json();
}

// Create ColdIQ button
function createColdIQButton() {
  const button = document.createElement('div');
  button.className = 'coldiq-button';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" fill="#d4af37"/>
      <path d="M4 6L12 12L20 6" stroke="black" stroke-width="2" stroke-linecap="round"/>
      <path d="M4 6H20V18H4V6Z" stroke="black" stroke-width="2"/>
    </svg>
    <span>Analyze</span>
  `;
  button.title = 'Analyze with ColdIQ';
  return button;
}

// Create result panel
function createResultPanel() {
  const panel = document.createElement('div');
  panel.className = 'coldiq-panel';
  panel.innerHTML = `
    <div class="coldiq-panel-header">
      <div class="coldiq-panel-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" fill="#d4af37"/>
          <path d="M4 6L12 12L20 6" stroke="black" stroke-width="2"/>
          <path d="M4 6H20V18H4V6Z" stroke="black" stroke-width="2"/>
        </svg>
        <span>ColdIQ Analysis</span>
      </div>
      <button class="coldiq-panel-close">&times;</button>
    </div>
    <div class="coldiq-panel-content">
      <div class="coldiq-loading">
        <div class="coldiq-spinner"></div>
        <p>Analyzing your email...</p>
      </div>
    </div>
  `;
  return panel;
}

// Render analysis result
function renderAnalysisResult(panel, analysis) {
  const content = panel.querySelector('.coldiq-panel-content');
  
  const scoreColor = analysis.analysis_score >= 70 ? '#a3e635' : 
                     analysis.analysis_score >= 50 ? '#d4af37' : '#ef4444';
  
  content.innerHTML = `
    <div class="coldiq-score" style="border-color: ${scoreColor}">
      <div class="coldiq-score-value" style="color: ${scoreColor}">${analysis.analysis_score}</div>
      <div class="coldiq-score-label">Score</div>
    </div>
    
    <div class="coldiq-metrics">
      <div class="coldiq-metric">
        <span class="coldiq-metric-value">${analysis.predicted_open_rate}%</span>
        <span class="coldiq-metric-label">Open Rate</span>
      </div>
      <div class="coldiq-metric">
        <span class="coldiq-metric-value">${analysis.predicted_response_rate}%</span>
        <span class="coldiq-metric-label">Response Rate</span>
      </div>
    </div>
    
    ${analysis.strengths && analysis.strengths.length > 0 ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title coldiq-success">Strengths</h4>
        <ul class="coldiq-list">
          ${analysis.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${analysis.weaknesses && analysis.weaknesses.length > 0 ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title coldiq-warning">Areas to Improve</h4>
        <ul class="coldiq-list">
          ${analysis.weaknesses.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${analysis.optimized_subject ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title">Optimized Subject</h4>
        <div class="coldiq-optimized">
          <p>${analysis.optimized_subject}</p>
          <button class="coldiq-copy-btn" data-copy="subject">Copy</button>
        </div>
      </div>
    ` : ''}
    
    ${analysis.rewritten_email ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title">Optimized Email</h4>
        <div class="coldiq-optimized coldiq-optimized-body">
          <p>${analysis.rewritten_email.replace(/\n/g, '<br>')}</p>
          <button class="coldiq-copy-btn" data-copy="body">Copy</button>
        </div>
      </div>
    ` : ''}
    
    <a href="https://cold-email-ai-2.preview.emergentagent.com/history" target="_blank" class="coldiq-cta">
      View Full Analysis →
    </a>
  `;
  
  // Add copy functionality
  content.querySelectorAll('.coldiq-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.copy;
      const text = type === 'subject' ? analysis.optimized_subject : analysis.rewritten_email;
      navigator.clipboard.writeText(text);
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  });
}

// Render error
function renderError(panel, message) {
  const content = panel.querySelector('.coldiq-panel-content');
  content.innerHTML = `
    <div class="coldiq-error">
      <p>${message}</p>
      <a href="https://cold-email-ai-2.preview.emergentagent.com/login" target="_blank" class="coldiq-cta">
        Log in to ColdIQ
      </a>
    </div>
  `;
}

// Get email content from compose window
function getEmailContent(composeWindow) {
  // Subject
  const subjectInput = composeWindow.querySelector('input[name="subjectbox"]');
  const subject = subjectInput ? subjectInput.value : '';
  
  // Body - Gmail uses contenteditable div
  const bodyDiv = composeWindow.querySelector('div[aria-label="Message Body"]') ||
                  composeWindow.querySelector('div[contenteditable="true"][aria-multiline="true"]') ||
                  composeWindow.querySelector('.Am.Al.editable');
  const body = bodyDiv ? bodyDiv.innerText : '';
  
  return { subject, body };
}

// Inject ColdIQ into compose toolbar
function injectColdIQButton(composeWindow) {
  // Check if already injected
  if (composeWindow.querySelector('.coldiq-button')) return;
  
  // Find toolbar
  const toolbar = composeWindow.querySelector('tr.btC td.gU');
  if (!toolbar) return;
  
  // Create and insert button
  const button = createColdIQButton();
  toolbar.insertBefore(button, toolbar.firstChild);
  
  // Create panel (hidden initially)
  const panel = createResultPanel();
  composeWindow.appendChild(panel);
  
  // Close panel handler
  panel.querySelector('.coldiq-panel-close').addEventListener('click', () => {
    panel.classList.remove('coldiq-panel-visible');
  });
  
  // Button click handler
  button.addEventListener('click', async () => {
    const { subject, body } = getEmailContent(composeWindow);
    
    if (!body.trim()) {
      alert('Please write some email content first.');
      return;
    }
    
    // Show panel with loading
    panel.classList.add('coldiq-panel-visible');
    panel.querySelector('.coldiq-panel-content').innerHTML = `
      <div class="coldiq-loading">
        <div class="coldiq-spinner"></div>
        <p>Analyzing your email...</p>
      </div>
    `;
    
    try {
      const token = await getToken();
      if (!token) {
        renderError(panel, 'Please log in to ColdIQ to analyze emails.');
        return;
      }
      
      const analysis = await analyzeEmail(subject, body, token);
      renderAnalysisResult(panel, analysis);
    } catch (error) {
      renderError(panel, error.message || 'Analysis failed. Please try again.');
    }
  });
}

// Observer for new compose windows
const observer = new MutationObserver(debounce((mutations) => {
  // Look for compose windows
  const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"]');
  composeWindows.forEach(injectColdIQButton);
  
  // Also check for inline compose
  const inlineCompose = document.querySelectorAll('div.nH.if');
  inlineCompose.forEach(injectColdIQButton);
}, 500));

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial check
setTimeout(() => {
  const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"], div.nH.if');
  composeWindows.forEach(injectColdIQButton);
}, 2000);

console.log('ColdIQ extension loaded');
