#!/usr/bin/env node

import puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

const __dirname = path.resolve(path.dirname(''));

// import { default as generator } from './generator.js';

(async () => {
  const browser = await puppeteer.launch({
    // devtools: true,
    args: [
      '--disable-web-security',
    ],
  });
  const page = await browser.newPage();
  const targetUrl = 'https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html';

  // await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})

  const filepath = path.join(__dirname, "./generator.js");

  await page.goto(targetUrl, {
    waitUntil: 'networkidle2'
  });

  await page.addScriptTag({path: path.resolve(filepath)});

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

  const dataString = await page.evaluate(() => {
      return generator();
  });

  console.log(dataString);
  // console.log(typeof dataString);

  fs.writeFileSync('./js/data.js', dataString);

  await browser.close();
})();