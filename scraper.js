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

    }catch{
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

    // must match full PRC row
    if(tds.length < 8) return;

    let rawDate = $(tds[2]).text().trim();

    /* 🔥 FIX START (ONLY PART CHANGED) */
    rawDate = rawDate
      .replace(/and/g, "")
      .replace(/\s+/g, " ")
      .trim();

    let monthMatch = rawDate.match(/([A-Za-z]+)/);
    let month = monthMatch ? monthMatch[1] : "";

    let yearMatch = rawDate.match(/(\d{4})/);
    let yearVal = yearMatch ? yearMatch[1] : result.year;

    let days = rawDate.match(/\d{1,2}/g) || [];
    days = days.map(Number).filter(d => d <= 31);

    let cleanDate = rawDate;

    if(days.length > 1){
      // keep space format so Blogger formatRange works
      cleanDate = `${month} ${Math.min(...days)} ${Math.max(...days)}, ${yearVal}`;
    } else if(days.length === 1){
      cleanDate = `${month} ${days[0]}, ${yearVal}`;
    } else {
      cleanDate = `${rawDate}, ${yearVal}`;
    }
    /* 🔥 FIX END */

    data.push({
      n: $(tds[1]).text().trim(),      // NAME
      start: $(tds[5]).text().trim(),  // START
      d: $(tds[6]).text().trim(),      // DEADLINE
      e: cleanDate,                    // FIXED EXAM DATE
      r: $(tds[7]).text().trim()       // RESULT
    });
  });

  const output = {
    year: result.year,
    updated: new Date().toISOString(),
    data: data
  };

  const file = `prc-${result.year}.json`;

  let oldData = "";
  if(fs.existsSync(file)){
    oldData = fs.readFileSync(file, "utf-8");
  }

  const newData = JSON.stringify(output, null, 2);

  if(oldData === newData){
    console.log("No changes detected");
    process.exit(0);
  }

  fs.writeFileSync(file, newData);

  console.log("Updated file correctly");

}

run();
