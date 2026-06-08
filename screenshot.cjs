const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1600, height: 900 }
  });
  const page = await browser.newPage();
  
  console.log("Navigating to http://localhost:3000...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  
  console.log("Waiting for rendering...");
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const artifactsDir = "C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\3504c802-117d-4f18-a634-6bfff83ab496";
  const outputPath = `${artifactsDir}\\dashboard_puppeteer.png`;
  
  console.log(`Taking screenshot to ${outputPath}...`);
  await page.screenshot({ path: outputPath, fullPage: true });
  
  await browser.close();
  console.log("Done!");
})();
