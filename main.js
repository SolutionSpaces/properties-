const Apify = require('apify');
const puppeteer = require('puppeteer');
const typeCheck = require('type-check').typeCheck;

// Definition of the input
const INPUT_TYPE = `{
    target: String,
}`;

async function extractText(page, selector) {
    try {
        return await page.$eval(selector, element => element.innerText);
    } catch(e) {
        return null;
    }
}

async function extractNumber(page, selector) {
    try {
        const value = await extractText(page, selector)
        if (value !== null) {
            return value.match(/\d+/g).join('')
        }
    } catch(e) {
        return null;
    }
}

Apify.main(async () => {
    const input = await Apify.getValue('INPUT');
    if (!typeCheck(INPUT_TYPE, input)) {
        console.log('Expected input:');
        console.log(INPUT_TYPE);
        console.log('Received input:');
        console.dir(input);
        throw new Error('Received invalid input');
    }

    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    await page.goto(input.target, { waitUntil: 'networkidle2' });

    const title = await extractText(page, '#expose-title');
    const price = await extractNumber(page, '.is24qa-kaltmiete');
    const rooms = await extractText(page, '.is24qa-zi');
    const size = await extractNumber(page, '.is24qa-flaeche');
    const attributes = await extractText(page, '.boolean-listing');
    const proximity = await extractText(page, '.is24qa-lage');
    const facilities = await extractText(page, '.is24qa-ausstattung');
    const description = await extractText(page, '.is24qa-objektbeschreibung');
    const misc = await extractText(page, '.is24qa-sonstiges');
    const utilities = await extractNumber(page, '.is24qa-nebenkosten');
    const heatingCosts = await extractNumber(page, '.is24qa-heizkosten');
    const totalPrice = await extractNumber(page, '.is24qa-gesamtmiete');
    const ids = await extractText(page, '.is24-scoutid__content');
    const address = await extractText(page, '.address-block');
    const available = await extractText(page, '.is24qa-bezugsfrei-ab');
    const buildingType = await extractText(page, '.is24qa-typ');
    const buildYear = await extractText(page, '.is24qa-baujahr');
    const condition = await extractText(page, '.is24qa-objektzustand');
    const heating = await extractText(page, '.is24qa-heizungsart');
    const energySource = await extractText(page, '.is24qa-wesentliche-energietraeger');
    const images = await page.$$eval('img.sp-image', imgs => imgs.map((img) => img.getAttribute('data-src')));

    browser.close();

    console.log(price)

    // Store the output
    const output = {
        url: input.target,
        ids: ids,
        title: title,
        price: price,
        rooms: rooms,
        size: size,
        attributes: attributes.replace('/ ', '/').split(' '),
        proximity: proximity,
        facilities: facilities,
        description: description,
        misc: misc,
        utilities: utilities,
        heatingCosts: heatingCosts,
        totalPrice: totalPrice,
        address: address,
        available: available,
        buildingType: buildingType,
        buildYear: buildYear,
        condition: condition,
        heating: heating,
        energySource: energySource,
        images: images
    };

    console.log(output)
    await Apify.setValue('OUTPUT', output)
});
