const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof";

const scrapeResults = [];

async function scrapeCraigslist() {
  try {
    const htmlResult = await request.get(url);
    const $ = cheerio.load(htmlResult);

    $(".result-info").each((index, element) => {
      const resultTitle = $(element).children(".result-title");

      const title = resultTitle.text();
      const url = resultTitle.attr("href");

      const scrapeResult = { title, url };
      scrapeResults.push(scrapeResult);
    });
  } catch (error) {
    console.log(error);
  }
}

scrapeCraigslist();
