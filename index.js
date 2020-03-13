const request = require("request-promise");
const cheerio = require("cheerio");

const url = "https://sfbay.craigslist.org/d/software-qa-dba-etc/search/sof";

const scrapeResults = [];

async function scrapeJobHeader() {
  try {
    const htmlResult = await request.get(url);
    const $ = cheerio.load(htmlResult);

    $(".result-info").each((index, element) => {
      const resultTitle = $(element).children(".result-title");

      const title = resultTitle.text();
      const url = resultTitle.attr("href");
      const datePosted = $(element)
        .children("time")
        .attr("datetime");
      const hood = $(element)
        .find(".result-hood")
        .text();

      const scrapeResult = { title, url, datePosted, hood };
      scrapeResults.push(scrapeResult);
    });

    return scrapeResults;
  } catch (error) {
    console.log(error);
  }
}

async function scrapeDescription(jobsWithHeaders) {
  return Promise.all(
    jobsWithHeaders.map(async job => {
      const htmlResult = await request.get(job.url);
      const $ = await cheerio.load(htmlResult);

      $(".print-qrcode-container").remove();
      const description = $("#postingbody").text();
      const address = $("div.mapaddress").text();
      const compensation = $(".attrgroup")
        .children()
        .first()
        .text()
        .replace("compensation: ", "");

      return { ...job, description, address, compensation };
    })
  );
}

async function createCsvFile(data) {
  const csv = new ObjectsToCsv(data);

  // Save to file:
  await csv.toDisk("./data.csv");
}

async function scrapeCraigslist() {
  const jobsWithHeaders = await scrapeJobHeader();
  const jobsFullData = await scrapeDescription(jobsWithHeaders);

  await createCsvFile(jobsFullData);
}

scrapeCraigslist();
