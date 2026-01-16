# ColdIQ Chrome Extension

AI-powered cold email analyzer that works directly inside Gmail.

## Features

- **Analyze emails in Gmail**: Click the ColdIQ button in any compose window to get instant AI analysis
- **Score & Metrics**: See your email's effectiveness score, predicted open rate, and response rate
- **AI Rewrites**: Get optimized subject lines and email body suggestions
- **One-Click Apply**: Apply the optimized content directly to your email with one click
- **Copy to Clipboard**: Easily copy optimized content
- **Context Menu**: Right-click on selected text to analyze it

## Installation (Developer Mode)

### Step 1: Download the Extension
The extension files are located in `/app/chrome-extension/`:
```
chrome-extension/
├── manifest.json       # Extension configuration
├── background.js       # Service worker
├── content.js         # Gmail injection script
├── content.css        # Styles for Gmail
├── popup.html         # Extension popup UI
├── popup.js           # Popup functionality
├── popup.css          # Popup styles
└── icons/             # Extension icons
```

### Step 2: Load in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. The ColdIQ icon should appear in your extensions bar

### Step 3: Pin the Extension
1. Click the puzzle piece icon in Chrome toolbar
2. Find ColdIQ and click the pin icon

## Usage

### Login
1. Click the ColdIQ extension icon
2. Enter your ColdIQ account credentials
3. You'll see your usage stats and tier information

### Analyze an Email
1. Open Gmail (https://mail.google.com)
2. Click **Compose** or reply to an email
3. Write your cold email
4. Click the gold **Analyze** button in the compose toolbar
5. View your analysis in the side panel
6. Click **Apply to Email** to use the optimized version

### Context Menu
1. Select any text on a webpage
2. Right-click and choose "Analyze with ColdIQ"
3. Opens the full ColdIQ analyzer with the selected text

## API Integration

The extension connects to the ColdIQ API at:
```
https://coldiq-dashboard.preview.emergentagent.com/api
```

### Endpoints Used
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get user info
- `GET /user/usage` - Get usage stats
- `POST /analysis/analyze` - Analyze email

## Development

### Testing Changes
1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the ColdIQ extension
4. Reload Gmail to test content script changes

### Debugging
- **Popup**: Right-click extension icon → Inspect popup
- **Content Script**: Open Gmail → F12 → Console (look for "ColdIQ" messages)
- **Background**: chrome://extensions/ → ColdIQ → "Service worker" link

### Known Gmail Selectors
Gmail's DOM structure can change. The extension uses multiple fallback selectors:
- Compose dialog: `div.nH.Hd[role="dialog"]`
- Inline compose: `div.nH.if`
- Subject input: `input[name="subjectbox"]`
- Body: Multiple selectors including `div[aria-label="Message Body"]`

## Troubleshooting

### Button Not Appearing
1. Refresh Gmail
2. Try opening a new compose window
3. Check Chrome console for errors
4. Reload the extension

### Analysis Not Working
1. Check if you're logged in (click extension icon)
2. Verify you haven't exceeded your monthly limit
3. Ensure the email body has content

### "Please log in" Error
1. Click the extension icon
2. Log out and log back in
3. Your session may have expired

## File Structure

```
chrome-extension/
├── manifest.json          # Manifest V3 configuration
├── background.js          # Service worker for message handling
├── content.js            # Injected into Gmail pages
├── content.css           # Styles for Gmail overlay
├── popup.html            # Extension popup HTML
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── icons/
│   ├── icon16.png       # Toolbar icon
│   ├── icon48.png       # Extension management icon
│   └── icon128.png      # Chrome Web Store icon
└── README.md             # This file
```

## Permissions

- `activeTab`: Access current tab to inject content
- `storage`: Store authentication token locally
- `https://mail.google.com/*`: Access Gmail pages

## Version History

### v1.0.0
- Initial release
- Gmail compose integration
- AI-powered analysis
- One-click apply feature
- Context menu support

## Support

For issues or feature requests:
- Email: support@coldiq.io
- Website: https://coldiq-dashboard.preview.emergentagent.com
