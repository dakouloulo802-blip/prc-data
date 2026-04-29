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

    if(tds.length < 5) return;

    let examDate = $(tds[3]).text().trim();

    // 🔥 CLEAN DATE (important for your countdown)
    examDate = examDate.split("-")[0].trim();

    data.push({
      n: $(tds[0]).text().trim(),
      start: $(tds[1]).text().trim(),
      d: $(tds[2]).text().trim(),
      e: examDate,
      r: $(tds[4]).text().trim()
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
    process.exit(0); // 🔥 STOP HERE (NO COMMIT)
  }

  fs.writeFileSync(file, newData);

  console.log("Updated file");

}

run();
