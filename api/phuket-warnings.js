import fetch from 'node-fetch';

export default async function handler(req, res) {
  const url = "https://www.meteoblue.com/en/weather/warnings/phuket_thailand_1151254";

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract only the weather warnings div
    const match = html.match(/<div class="weatherWarnings">(.*?)<\/div>/s);

    if (match && match[0]) {
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(match[0]);
    } else {
      res.status(200).send("<p>No warnings found</p>");
    }
  } catch (error) {
    res.status(500).send("Error fetching weather data");
  }
}
