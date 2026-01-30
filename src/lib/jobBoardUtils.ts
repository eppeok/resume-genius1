// Get regional job boards based on location
export function getRegionalJobBoards(location: string): string[] {
  const loc = location.toLowerCase();

  // India
  if (/india|bangalore|bengaluru|mumbai|delhi|hyderabad|chennai|pune|kolkata|noida|gurgaon/.test(loc)) {
    return ["LinkedIn", "Naukri", "Indeed", "Foundit"];
  }
  // Australia
  if (/australia|sydney|melbourne|brisbane|perth|adelaide/.test(loc)) {
    return ["LinkedIn", "Seek", "Indeed", "Jora"];
  }
  // UK
  if (/\buk\b|united kingdom|london|manchester|birmingham|glasgow|edinburgh|bristol/.test(loc)) {
    return ["LinkedIn", "Indeed", "Reed", "Totaljobs"];
  }
  // Canada
  if (/canada|toronto|vancouver|montreal|calgary|ottawa/.test(loc)) {
    return ["LinkedIn", "Indeed", "Workopolis", "Job Bank"];
  }
  // Germany
  if (/germany|berlin|munich|frankfurt|hamburg|düsseldorf|cologne/.test(loc)) {
    return ["LinkedIn", "Indeed", "StepStone", "XING"];
  }
  // Singapore
  if (/singapore/.test(loc)) {
    return ["LinkedIn", "Indeed", "JobStreet", "MyCareersFuture"];
  }
  // UAE/Middle East
  if (/uae|dubai|abu dhabi|united arab emirates|qatar|saudi/.test(loc)) {
    return ["LinkedIn", "Bayt", "GulfTalent", "Indeed"];
  }
  // Remote
  if (/remote/.test(loc)) {
    return ["LinkedIn", "Indeed", "We Work Remotely", "Remote.co"];
  }
  // Default: US and Global
  return ["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter"];
}

// Format job boards list for display
export function formatJobBoardsList(boards: string[]): string {
  if (boards.length === 0) return "";
  if (boards.length === 1) return boards[0];
  if (boards.length === 2) return `${boards[0]} and ${boards[1]}`;
  
  const lastBoard = boards[boards.length - 1];
  const otherBoards = boards.slice(0, -1).join(", ");
  return `${otherBoards}, and ${lastBoard}`;
}
