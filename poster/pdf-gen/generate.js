const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();
    
    // Set a high viewport to help with rendering
    await page.setViewport({ width: 2304, height: 5760 });

    console.log("Navigating to local server...");
    await page.goto('http://localhost:5500/poster.html', {
      waitUntil: 'networkidle0', // Wait for all images/fonts to load
      timeout: 30000
    });

    console.log("Generating PDF...");
    await page.pdf({
      path: '../poster_final.pdf',
      width: '24in',
      height: '60in',
      printBackground: true, // This is crucial for the dark theme!
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    console.log("PDF generated successfully at poster_final.pdf");
  } catch (err) {
    console.error("Error generating PDF:", err);
  }
})();
