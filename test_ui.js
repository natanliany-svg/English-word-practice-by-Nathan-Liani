const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
app.use(express.static('.'));

const server = app.listen(3000, async () => {
    console.log('Server started on port 3000');
    
    try {
        const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 414, height: 896 }); // Mobile view
        
        // Listen to console logs
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', err => console.error('PAGE ERROR:', err));

        await page.goto('http://localhost:3000');
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'screenshots/01_home.png' });
        
        console.log('Clicking on Focus Vocabulary...');
        await page.evaluate(() => {
            document.querySelector('.home-card.focus-glow .control-btn:nth-child(1)').click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'screenshots/02_focus_vocab.png' });
        
        console.log('Going back Home...');
        await page.evaluate(() => window.setWeek('home'));
        await new Promise(r => setTimeout(r, 1000));
        
        console.log('Clicking on Focus Article...');
        await page.evaluate(() => {
            document.querySelector('.home-card.focus-glow .control-btn:nth-child(2)').click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'screenshots/03_focus_article.png' });
        
        console.log('Going back Home...');
        await page.evaluate(() => window.setWeek('home'));
        await new Promise(r => setTimeout(r, 1000));

        console.log('Clicking on Focus Quiz...');
        await page.evaluate(() => {
            document.querySelector('.home-card.focus-glow .control-btn:nth-child(3)').click();
        });
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: 'screenshots/04_focus_quiz.png' });
        
        await browser.close();
    } catch (e) {
        console.error('PUPPETEER ERROR:', e);
    }
    
    server.close();
});
