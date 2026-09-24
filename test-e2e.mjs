import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text();
      // Ignore some common vite dev server warnings if necessary
      errors.push(`[CONSOLE ${msg.type().toUpperCase()}] ${text}`);
      console.log(`[PAGE CONSOLE ${msg.type().toUpperCase()}]`, text);
    }
  });

  page.on('pageerror', err => {
    errors.push(`[PAGE ERROR] ${err.message}`);
    console.log('[PAGE ERROR]', err.message);
  });

  try {
    console.log('Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login');

    console.log('Filling in credentials...');
    // We try multiple common selectors for email and password
    await page.fill('input[type="text"], input[name="email"]', 'aba@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'Passer@123');

    console.log('Submitting login form...');
    // find submit button or generic button
    await page.click('button[type="submit"], button:has-text("Se connecter"), button:has-text("Login")');

    console.log('Waiting for dashboard to load...');
    await page.waitForURL('**/', { timeout: 15000 }).catch(e => console.log('Wait for URL timeout, continuing...'));
    await page.waitForTimeout(3000);

    const sections = ['Ventes', 'Stock', 'Clients', 'Demandes', 'Paramètres'];
    
    for (const section of sections) {
      console.log(`\nNavigating to ${section}...`);
      try {
        // Find a link or button containing the text
        const element = page.locator(`text="${section}"`).first();
        if (await element.count() > 0) {
          await element.click();
          await page.waitForTimeout(2000); // wait for page to render and catch errors
        } else {
          console.log(`Could not find navigation element for ${section}`);
          errors.push(`[TEST ERROR] Navigation element for '${section}' not found`);
        }
      } catch (err) {
        console.log(`Error clicking ${section}:`, err.message);
        errors.push(`[TEST ERROR] Failed to navigate to '${section}': ${err.message}`);
      }
    }
  } catch (err) {
    console.error('Fatal Script Error:', err);
    errors.push(`[FATAL SCRIPT ERROR] ${err.message}`);
  } finally {
    console.log('\n==================================================');
    console.log('TEST COMPLETE');
    console.log('Total Errors/Warnings Found:', errors.length);
    errors.forEach(e => console.log(' -', e));
    console.log('==================================================\n');
    await browser.close();
  }
})();
