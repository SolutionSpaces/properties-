const Apify = require("apify");
const { scrape } = require("spidergraph");
const puppeteer = require("puppeteer");

async function isArchived(page, response) {
  const text = await page.$eval(
    ".status-message",
    element => element.textContent
  );
  return response.status() == 404 || /Angebot\sliegt\sim\sArchiv/.test(text);
}

Apify.main(async () => {
  await Apify.setValue("OUTPUT", { foo: "bar" });
  const input = await Apify.getValue("INPUT");
  const keys = Object.keys(input).filter(name => /link_url/.test(name));
  const links = Array.from(
    new Set(
      keys.reduce(function(a, k) {
        a.push(input[k]);
        return a;
      }, [])
    )
  );

  const browser = await Apify.launchPuppeteer({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  const output = await links.reduce(async (previousPromise, link) => {
    const collection = await previousPromise;
    await page.goto(link, { waitUntil: "networkidle2" });
    const result = await scrape(page);
    collection.push(result);
    return collection;
  }, Promise.resolve([]));

  browser.close();
  await Apify.setValue("OUTPUT", output.flat());
});
