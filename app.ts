import { Anthropic } from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import axios from "axios";
import { google } from "googleapis";
dotenv.config();

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Google Custom Search API details
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

// Google Sheets API details
const GOOGLE_SHEETS_ID = process.env.GOOGLE_SHEETS_ID;
const auth = new google.auth.GoogleAuth({
  keyFile: "./sheet-info.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

async function searchForPrice(
  serviceName: string,
  plan: string
): Promise<string> {
  const query = `${serviceName} ${plan} fiyat Türkiye abonelik ücreti`;
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items || [];
    const searchResults = items
      .map((item) => `${item.title}\n${item.snippet}`)
      .join("\n\n");
    return searchResults;
  } catch (error) {
    console.error(
      `Error searching for ${serviceName} ${plan}: ${error.message}`
    );
    return "";
  }
}

async function extractPrice(
  searchResults: string,
  serviceName: string,
  plan: string
): Promise<number> {
  const response = await anthropic.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Search results for ${serviceName} ${plan} subscription price in Turkey:\n\n${searchResults}\n\nExtract the current subscription price for ${serviceName} ${plan} from the above text. The price should be in Turkish Lira (TL or ₺). Return only the numeric price value, without currency symbol. If multiple prices are found, return the most relevant one for the ${serviceName} plan. If you can't find a price, explain why and return -1.`,
      },
    ],
  });
  console.log(
    `Claude's response for ${serviceName}: ${response.content[0].text.trim()}`
  );
  const priceString = response.content[0].text.trim();
  const priceMatch = priceString.match(/\d+(\.\d+)?/);
  return priceMatch ? parseFloat(priceMatch[0]) : -1;
}

const services = [
  { name: "Netflix Özel", plan: "", row: 4 },
  { name: "Disney+ Yearly", plan: "", row: 5 },
  { name: "Amazon Prime", plan: "", row: 6 },
  { name: "Hepsiburada Premium Yillik", plan: "", row: 7 },
  { name: "Spotify Duo", plan: "", row: 8 },
  { name: "Xbox Game Pass Ultimate", plan: "", row: 9 },
  { name: "ICloud+ 200 GB", plan: "", row: 10 },
];

async function updateGoogleSheet(
  updates: Array<{ name: string; price: number; row: number }>
) {
  for (const update of updates) {
    try {
      // Update only the Amount column (G) without currency symbol
      await sheets.spreadsheets.values.update({
        spreadsheetId: GOOGLE_SHEETS_ID,
        range: `G${update.row}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[update.price]],
        },
      });

      console.log(
        `Updated ${update.name} price to ${update.price} in column G`
      );
    } catch (error) {
      console.error(`Error updating ${update.name}: ${error.message}`);
    }
  }
}

async function main() {
  const updates: Array<{ name: string; price: number; row: number }> = [];

  for (const service of services) {
    try {
      console.log(`Searching for ${service.name} price...`);
      const searchResults = await searchForPrice(service.name, service.plan);
      const price = await extractPrice(
        searchResults,
        service.name,
        service.plan
      );
      if (price !== -1) {
        updates.push({ name: service.name, price, row: service.row });
        console.log(`${service.name} price: ${price}`);
      } else {
        console.log(`Could not find price for ${service.name}`);
      }
    } catch (error) {
      console.error(`Error processing ${service.name}: ${error.message}`);
    }
  }

  if (updates.length > 0) {
    await updateGoogleSheet(updates);
    console.log("Google Sheet updated successfully.");
  } else {
    console.log("No updates to apply to Google Sheet.");
  }
}

main().catch(console.error);
