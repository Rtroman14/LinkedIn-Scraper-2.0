# LinkedIn Scraper 2.0

This web scraper logs into a LinkedIn account, exctracts all contacts information, and records that data into a local Excel file.

## Prerequisites

Use the package manager npm to install Puppeteer

```bash
npm install puppeteer
```

### Usage

```javascript
const puppeteer = require("puppeteer");
```

## Steps

Check out "Flowchart.png" to visually understand how this script works.

1. Create new tab in Google Sheets for LinkedIn user
2. Update "accounts.js" with correct information
3. Run script
