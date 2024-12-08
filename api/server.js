const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const trackingNumber = req.query.trackingNumber;
  if (!trackingNumber) {
    return res.json({ success: false, error: 'Numer przesyłki jest wymagany.' });
  }

  try {
    const result = await trackPackage(trackingNumber);
    if (Array.isArray(result)) {
      res.json({ success: true, data: result });
    } else {
      res.json({ success: false, error: result });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

async function trackPackage(trackingNumber) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const trackingURL = `https://inpost.pl/sledzenie-przesylek?number=${trackingNumber}`;
  await page.goto(trackingURL, { waitUntil: 'networkidle2' });

  const result = await page.evaluate(() => {
    const element = document.querySelector('.tracking-status');
    return element ? element.innerText : 'Nie znaleziono danych';
  });

  await browser.close();
  return result;
}
