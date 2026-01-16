// ColdIQ Chrome Extension - Popup Script
const API_URL = 'https://coldiq-dashboard.preview.emergentagent.com/api';

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const statusIndicator = document.getElementById('status-indicator');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userTier = document.getElementById('user-tier');
const usageText = document.getElementById('usage-text');
const usageFill = document.getElementById('usage-fill');

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const token = await getStoredToken();
  if (token) {
    await loadUserData(token);
  } else {
    showLoginSection();
  }
});

// Storage helpers
async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['coldiq_token'], (result) => {
      resolve(result.coldiq_token || null);
    });
  });
}

async function setStoredToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ coldiq_token: token }, resolve);
  });
}

async function clearStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['coldiq_token', 'coldiq_user'], resolve);
  });
}

async function setStoredUser(user) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ coldiq_user: user }, resolve);
  });
}

// UI helpers
function showLoginSection() {
  loginSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
  statusIndicator.classList.remove('connected');
}

function showDashboardSection() {
  loginSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  statusIndicator.classList.add('connected');
}

function showError(message) {
  loginError.textContent = message;
  loginError.classList.remove('hidden');
}

function hideError() {
  loginError.classList.add('hidden');
}

function setLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.innerHTML = loading 
    ? '<span class="loading"></span>' 
    : 'Sign In';
}

// API calls
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Login failed');
  }
  
  return response.json();
}

async function fetchUsage(token) {
  const response = await fetch(`${API_URL}/user/usage`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch usage');
  }
  
  return response.json();
}

async function fetchUser(token) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}

// Load user data
async function loadUserData(token) {
  try {
    const [user, usage] = await Promise.all([
      fetchUser(token),
      fetchUsage(token)
    ]);
    
    await setStoredUser(user);
    
    // Update UI
    userAvatar.textContent = user.full_name?.charAt(0) || 'U';
    userName.textContent = user.full_name || 'User';
    
    const tierLabel = user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1);
    userTier.textContent = tierLabel;
    userTier.className = 'user-tier' + (user.subscription_tier === 'free' ? ' free' : '');
    
    const limit = usage.limit === 999999 ? '∞' : usage.limit;
    usageText.textContent = `${usage.used} / ${limit}`;
    
    const percentage = usage.limit === 999999 ? 0 : (usage.used / usage.limit) * 100;
    usageFill.style.width = `${Math.min(percentage, 100)}%`;
    
    showDashboardSection();
  } catch (error) {
    console.error('Failed to load user data:', error);
    await clearStoredToken();
    showLoginSection();
  }
}

// Event handlers
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideError();
  setLoading(true);
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const data = await login(email, password);
    await setStoredToken(data.token);
    await loadUserData(data.token);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

logoutBtn.addEventListener('click', async () => {
  await clearStoredToken();
  showLoginSection();
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
});
