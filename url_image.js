const fetch = (...args) => import('node-fetch').then(m => m.default(...args));

async function extractWebpLinks(url) {
  const res = await fetch(url);
  const html = await res.text();
  console.log

  const regex = /https?:\/\/[^\s"'<>]+\.webp/g;
  const matches = html.match(regex) || [];
  const unique = [...new Set(matches)];

  return unique;
}

extractWebpLinks("https://www.gentube.app/image/jn76mx71tcvr7a2j03yfhdaqhx89v9a3")
  .then(list => list.forEach(x => console.log(x)));
