// ColdIQ Chrome Extension - Content Script for Gmail
const API_URL = 'https://email-mentor.preview.emergentagent.com/api';

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

// Render analysis result - Using correct field names from API
function renderAnalysisResult(panel, analysis) {
  const content = panel.querySelector('.coldiq-panel-content');
  
  const score = analysis.analysis_score || 0;
  const scoreColor = score >= 70 ? '#a3e635' : 
                     score >= 50 ? '#d4af37' : '#ef4444';
  
  // API returns: estimated_open_rate, estimated_response_rate, rewritten_subject, rewritten_body
  const openRate = analysis.estimated_open_rate || 0;
  const responseRate = analysis.estimated_response_rate || 0;
  const optimizedSubject = analysis.rewritten_subject || '';
  const optimizedBody = analysis.rewritten_body || '';
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const keyInsight = analysis.key_insight || '';
  
  content.innerHTML = `
    <div class="coldiq-score" style="border-color: ${scoreColor}">
      <div class="coldiq-score-value" style="color: ${scoreColor}">${score}</div>
      <div class="coldiq-score-label">Score</div>
    </div>
    
    <div class="coldiq-metrics">
      <div class="coldiq-metric">
        <span class="coldiq-metric-value">${openRate}%</span>
        <span class="coldiq-metric-label">Open Rate</span>
      </div>
      <div class="coldiq-metric">
        <span class="coldiq-metric-value">${responseRate}%</span>
        <span class="coldiq-metric-label">Response Rate</span>
      </div>
    </div>
    
    ${keyInsight ? `
      <div class="coldiq-section coldiq-insight">
        <h4 class="coldiq-section-title">💡 Key Insight</h4>
        <p class="coldiq-insight-text">${keyInsight}</p>
      </div>
    ` : ''}
    
    ${strengths.length > 0 ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title coldiq-success">✓ Strengths</h4>
        <ul class="coldiq-list">
          ${strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${weaknesses.length > 0 ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title coldiq-warning">⚠ Areas to Improve</h4>
        <ul class="coldiq-list">
          ${weaknesses.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${optimizedSubject ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title">Optimized Subject</h4>
        <div class="coldiq-optimized">
          <p>${optimizedSubject}</p>
          <button class="coldiq-copy-btn" data-copy="subject" data-text="${encodeURIComponent(optimizedSubject)}">Copy</button>
        </div>
      </div>
    ` : ''}
    
    ${optimizedBody ? `
      <div class="coldiq-section">
        <h4 class="coldiq-section-title">Optimized Email</h4>
        <div class="coldiq-optimized coldiq-optimized-body">
          <p>${optimizedBody.replace(/\n/g, '<br>')}</p>
          <button class="coldiq-copy-btn coldiq-copy-body" data-copy="body" data-text="${encodeURIComponent(optimizedBody)}">Copy</button>
        </div>
      </div>
    ` : ''}
    
    <div class="coldiq-actions">
      <button class="coldiq-apply-btn" data-subject="${encodeURIComponent(optimizedSubject)}" data-body="${encodeURIComponent(optimizedBody)}">
        Apply to Email
      </button>
    </div>
    
    <a href="https://email-mentor.preview.emergentagent.com/history" target="_blank" class="coldiq-cta">
      View Full Analysis →
    </a>
  `;
  
  // Add copy functionality
  content.querySelectorAll('.coldiq-copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = decodeURIComponent(btn.dataset.text);
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('coldiq-copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('coldiq-copied');
        }, 2000);
      });
    });
  });
  
  // Add apply to email functionality
  const applyBtn = content.querySelector('.coldiq-apply-btn');
  if (applyBtn) {
    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const subject = decodeURIComponent(applyBtn.dataset.subject);
      const body = decodeURIComponent(applyBtn.dataset.body);
      applyToComposeWindow(subject, body, panel);
    });
  }
}

// Apply optimized content to compose window
function applyToComposeWindow(subject, body, panel) {
  const composeWindow = panel.closest('div.nH.Hd[role="dialog"]') || 
                        panel.closest('div.nH.if') ||
                        document.querySelector('div.nH.Hd[role="dialog"]') ||
                        document.querySelector('div.nH.if');
  
  if (!composeWindow) {
    alert('Could not find compose window. Please try copying manually.');
    return;
  }
  
  // Update subject
  if (subject) {
    const subjectInput = composeWindow.querySelector('input[name="subjectbox"]');
    if (subjectInput) {
      subjectInput.value = subject;
      subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  
  // Update body
  if (body) {
    const bodyDiv = findBodyElement(composeWindow);
    if (bodyDiv) {
      bodyDiv.innerHTML = body.replace(/\n/g, '<br>');
      bodyDiv.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  
  // Show confirmation
  const applyBtn = panel.querySelector('.coldiq-apply-btn');
  if (applyBtn) {
    applyBtn.textContent = 'Applied!';
    applyBtn.classList.add('coldiq-applied');
    setTimeout(() => {
      applyBtn.textContent = 'Apply to Email';
      applyBtn.classList.remove('coldiq-applied');
    }, 2000);
  }
}

// Render error
function renderError(panel, message, showLogin = true) {
  const content = panel.querySelector('.coldiq-panel-content');
  content.innerHTML = `
    <div class="coldiq-error">
      <div class="coldiq-error-icon">⚠</div>
      <p>${message}</p>
      ${showLogin ? `
        <a href="https://email-mentor.preview.emergentagent.com/login" target="_blank" class="coldiq-cta">
          Log in to ColdIQ
        </a>
      ` : ''}
    </div>
  `;
}

// Find body element in compose window - Gmail uses various selectors
function findBodyElement(composeWindow) {
  // Try multiple selectors as Gmail's DOM varies
  const selectors = [
    'div[aria-label="Message Body"]',
    'div[aria-label*="Message Body"]',
    'div[contenteditable="true"][aria-multiline="true"]',
    'div.Am.Al.editable',
    'div[role="textbox"][aria-label*="Body"]',
    'div.editable[contenteditable="true"]',
    'div[g_editable="true"]'
  ];
  
  for (const selector of selectors) {
    const element = composeWindow.querySelector(selector);
    if (element) return element;
  }
  
  // Fallback: find any contenteditable div that's not the subject
  const editables = composeWindow.querySelectorAll('div[contenteditable="true"]');
  for (const el of editables) {
    if (!el.closest('[name="subjectbox"]') && el.innerText.length > 0) {
      return el;
    }
  }
  
  return null;
}

// Get email content from compose window
function getEmailContent(composeWindow) {
  // Subject
  const subjectInput = composeWindow.querySelector('input[name="subjectbox"]');
  const subject = subjectInput ? subjectInput.value : '';
  
  // Body
  const bodyDiv = findBodyElement(composeWindow);
  const body = bodyDiv ? bodyDiv.innerText.trim() : '';
  
  return { subject, body };
}

// Find toolbar in compose window
function findToolbar(composeWindow) {
  // Try multiple toolbar selectors
  const selectors = [
    'tr.btC td.gU',
    'div[role="toolbar"]',
    'div.btC',
    'div.aDh',
    'td.gU.Up'
  ];
  
  for (const selector of selectors) {
    const toolbar = composeWindow.querySelector(selector);
    if (toolbar) return toolbar;
  }
  
  // Fallback: find the send button area
  const sendButton = composeWindow.querySelector('[role="button"][data-tooltip*="Send"]') ||
                     composeWindow.querySelector('[aria-label*="Send"]');
  if (sendButton) {
    return sendButton.parentElement;
  }
  
  return null;
}

// Inject ColdIQ into compose toolbar
function injectColdIQButton(composeWindow) {
  // Check if already injected
  if (composeWindow.querySelector('.coldiq-button')) return;
  
  // Find toolbar
  const toolbar = findToolbar(composeWindow);
  if (!toolbar) {
    console.log('ColdIQ: Could not find toolbar in compose window');
    return;
  }
  
  // Create and insert button
  const button = createColdIQButton();
  
  // Insert at the beginning of toolbar
  if (toolbar.firstChild) {
    toolbar.insertBefore(button, toolbar.firstChild);
  } else {
    toolbar.appendChild(button);
  }
  
  // Create panel (hidden initially)
  const panel = createResultPanel();
  document.body.appendChild(panel); // Append to body for better positioning
  
  // Close panel handler
  panel.querySelector('.coldiq-panel-close').addEventListener('click', () => {
    panel.classList.remove('coldiq-panel-visible');
  });
  
  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !button.contains(e.target)) {
      panel.classList.remove('coldiq-panel-visible');
    }
  });
  
  // Button click handler
  button.addEventListener('click', async (e) => {
    e.stopPropagation();
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
      console.error('ColdIQ analysis error:', error);
      if (error.message.includes('401') || error.message.includes('token')) {
        renderError(panel, 'Your session has expired. Please log in again.');
      } else if (error.message.includes('limit')) {
        renderError(panel, 'You\'ve reached your monthly analysis limit. Upgrade to continue.', false);
      } else {
        renderError(panel, error.message || 'Analysis failed. Please try again.', false);
      }
    }
  });
  
  console.log('ColdIQ: Button injected successfully');
}

// Observer for new compose windows
const observer = new MutationObserver(debounce((mutations) => {
  // Look for compose dialog windows
  const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"]');
  composeWindows.forEach(injectColdIQButton);
  
  // Also check for inline compose (reply)
  const inlineCompose = document.querySelectorAll('div.nH.if');
  inlineCompose.forEach(injectColdIQButton);
  
  // Check for new compose by looking for subject box
  const composeAreas = document.querySelectorAll('input[name="subjectbox"]');
  composeAreas.forEach(subjectBox => {
    const composeWindow = subjectBox.closest('div.nH') || subjectBox.closest('form');
    if (composeWindow) {
      injectColdIQButton(composeWindow);
    }
  });
}, 500));

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Initial check after page load
setTimeout(() => {
  const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"], div.nH.if');
  composeWindows.forEach(injectColdIQButton);
  console.log('ColdIQ: Initial compose window check complete');
}, 2000);

// Also listen for keyboard shortcut to open compose (c key in Gmail)
document.addEventListener('keydown', (e) => {
  if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    // Delay to wait for compose window to open
    setTimeout(() => {
      const composeWindows = document.querySelectorAll('div.nH.Hd[role="dialog"], div.nH.if');
      composeWindows.forEach(injectColdIQButton);
    }, 1000);
  }
});

console.log('ColdIQ extension loaded successfully');
