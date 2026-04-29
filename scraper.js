const fs = require("fs");
const cheerio = require("cheerio");

async function run(){

  const year = new Date().getFullYear();

  async function tryFetch(y){
    try{
      const res = await fetch(`https://www.prc.gov.ph/${y}-schedule-examination`);
      if(!res.ok) throw "fail";

      const html = await res.text();

      if(!html.includes("Schedule")) throw "not ready";

      console.log("Using year:", y);

      return {html, year: y};

    }catch(e){
      console.log("Failed year:", y);
      return null;
    }
  }

  let result = await tryFetch(year);
  if(!result) result = await tryFetch(year - 1);

  if(!result){
    console.log("No data found");
    return;
  }

  const $ = cheerio.load(result.html);

  let data = [];

  $("table tbody tr").each((i, el)=>{
    const tds = $(el).find("td");

    if(tds.length < 5) return;

    data.push({
      n: $(tds[0]).text().trim(),
      start: $(tds[1]).text().trim(),
      d: $(tds[2]).text().trim(),
      e: $(tds[3]).text().trim(),
      r: $(tds[4]).text().trim()
    });
  });

  const output = {
    year: result.year,
    data: data
  };

  fs.writeFileSync(`prc-${result.year}.json`, JSON.stringify(output, null, 2));

  console.log("Saved JSON successfully");

}

run();
