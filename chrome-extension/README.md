# ColdIQ Chrome Extension

Analyze and optimize your cold emails directly in Gmail with AI-powered insights.

## Features

- **In-Gmail Analysis**: Click the ColdIQ button in any Gmail compose window to analyze your email
- **Instant Scoring**: Get a 0-100 score with predicted open and response rates
- **Strengths & Weaknesses**: See what's working and what needs improvement
- **AI Rewrites**: Get an optimized version of your email ready to copy
- **Context Menu**: Right-click any selected text to analyze it with ColdIQ

## Installation

### From Chrome Web Store (Recommended)
*Coming soon*

### Manual Installation (Developer Mode)

1. Download or clone this folder
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `chrome-extension` folder
6. The ColdIQ icon should appear in your browser toolbar

## Usage

### Login
1. Click the ColdIQ icon in your browser toolbar
2. Enter your ColdIQ credentials
3. You'll see your usage stats and tier

### Analyzing Emails
1. Open Gmail and compose a new email
2. Write your cold email (subject and body)
3. Click the gold "Analyze" button in the compose toolbar
4. View your score, insights, and optimized version
5. Click "Copy" to use the optimized subject or body

### Quick Analyze
1. Select any text on a webpage
2. Right-click and choose "Analyze with ColdIQ"
3. Opens the full analyzer with your text pre-filled

## File Structure

```
chrome-extension/
├── manifest.json      # Extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic
├── content.js         # Gmail integration
├── content.css        # Gmail injection styles
├── background.js      # Service worker
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## API Endpoints Used

- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Fetch user data
- `GET /api/user/usage` - Fetch usage stats
- `POST /api/analysis/analyze` - Analyze email

## Permissions

- `activeTab`: Access the current tab for Gmail integration
- `storage`: Store authentication token locally
- `host_permissions`: Access mail.google.com for content script injection

## Troubleshooting

**Button not appearing in Gmail?**
- Refresh Gmail after installing the extension
- Make sure you're using the compose window (not reply)
- Try opening a new compose window

**Analysis failing?**
- Check you're logged in via the popup
- Verify your subscription has remaining analyses
- Check console for error messages

## Development

To modify the extension:
1. Make changes to the source files
2. Go to `chrome://extensions`
3. Click the refresh icon on the ColdIQ extension
4. Test your changes

## Support

- Website: https://cold-email-ai-2.preview.emergentagent.com
- Email: support@coldiq.com
