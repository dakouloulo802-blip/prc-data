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

    if(tds.length < 8) return;

    let rawDate = $(tds[2]).text().trim();

    /* 🔥 CLEAN TEXT */
    rawDate = rawDate
      .replace(/and/g, "")
      .replace(/\s+/g, " ")
      .trim();

    /* 🔥 EXTRACT MONTH */
    let monthMatch = rawDate.match(/([A-Za-z]+)/);
    let month = monthMatch ? monthMatch[1] : "";

    /* 🔥 EXTRACT YEAR */
    let yearMatch = rawDate.match(/(\d{4})/);
    let yearVal = yearMatch ? yearMatch[1] : result.year;

    /* 🔥 REMOVE YEAR BEFORE GETTING DAYS */
    let noYear = rawDate.replace(/\d{4}/, "");

    /* 🔥 EXTRACT DAYS */
    let days = noYear.match(/\d{1,2}/g) || [];
    days = days.map(Number).filter(d => d >= 1 && d <= 31);

    let cleanDate = rawDate;

    if(days.length > 1){

      /* 🔥 CHECK IF CONTINUOUS */
      let isContinuous = true;

      for(let i=1;i<days.length;i++){
        if(days[i] !== days[i-1] + 1){
          isContinuous = false;
          break;
        }
      }

      if(isContinuous){
        // 👉 continuous → range
        cleanDate = `${month} ${Math.min(...days)} ${Math.max(...days)}, ${yearVal}`;
      }else{
        // 👉 non-continuous → keep full list
        cleanDate = `${month} ${days.join(", ")}, ${yearVal}`;
      }

    } else if(days.length === 1){
      cleanDate = `${month} ${days[0]}, ${yearVal}`;
    } else {
      cleanDate = `${rawDate}, ${yearVal}`;
    }

    data.push({
      n: $(tds[1]).text().trim(),
      start: $(tds[5]).text().trim(),
      d: $(tds[6]).text().trim(),
      e: cleanDate,
      r: $(tds[7]).text().trim()
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
