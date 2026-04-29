let rawDate = $(tds[2]).text().trim();

/* 🔥 CLEAN TEXT */
rawDate = rawDate.replace(/and/g, "").replace(/\s+/g, " ").trim();

/* 🔥 EXTRACT MONTH + YEAR */
let monthMatch = rawDate.match(/([A-Za-z]+)/);
let yearMatch = rawDate.match(/(\d{4})/);

let month = monthMatch ? monthMatch[1] : "";
let year = yearMatch ? yearMatch[1] : result.year;

/* 🔥 EXTRACT ALL DAYS */
let days = rawDate.match(/\d{1,2}/g) || [];

/* remove invalid numbers (like year parts) */
days = days.map(Number).filter(d => d <= 31);

/* 🔥 BUILD DISPLAY RANGE */
let displayDate = rawDate;

if(days.length > 1){
  displayDate = `${month} ${Math.min(...days)}-${Math.max(...days)}, ${year}`;
}else if(days.length === 1){
  displayDate = `${month} ${days[0]}, ${year}`;
}

/* 🔥 FIRST DAY FOR COUNTDOWN */
let startDate = days.length ? `${month} ${days[0]}, ${year}` : displayDate;

data.push({
  n: $(tds[1]).text().trim(),
  start: $(tds[5]).text().trim(),
  d: $(tds[6]).text().trim(),
  e: displayDate,     // 👉 FULL RANGE FOR UI
  e_start: startDate, // 👉 FIRST DAY FOR LOGIC
  r: $(tds[7]).text().trim()
});
