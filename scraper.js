$("table tbody tr").each((i, el)=>{
  const tds = $(el).find("td");

  if(tds.length < 8) return;

  let rawDate = $(tds[2]).text().trim();

  /* CLEAN */
  rawDate = rawDate.replace(/and/g, "").replace(/\s+/g, " ").trim();

  /* EXTRACT */
  let monthMatch = rawDate.match(/([A-Za-z]+)/);
  let yearMatch = rawDate.match(/(\d{4})/);

  let month = monthMatch ? monthMatch[1] : "";
  let year = yearMatch ? yearMatch[1] : result.year;

  let days = rawDate.match(/\d{1,2}/g) || [];
  days = days.map(Number).filter(d => d <= 31);

  /* BUILD RANGE */
  let displayDate = rawDate;

  if(days.length > 1){
    displayDate = `${month} ${Math.min(...days)}-${Math.max(...days)}, ${year}`;
  } else if(days.length === 1){
    displayDate = `${month} ${days[0]}, ${year}`;
  }

  /* FIRST DAY */
  let startDate = days.length
    ? `${month} ${days[0]}, ${year}`
    : displayDate;

  data.push({
    n: $(tds[1]).text().trim(),
    start: $(tds[5]).text().trim(),
    d: $(tds[6]).text().trim(),
    e: displayDate,
    e_start: startDate,
    r: $(tds[7]).text().trim()
  });
});
