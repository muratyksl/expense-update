# Expense Update

This project automates the process of updating subscription prices for various services in a Google Sheet. It uses Google Custom Search API to find price information, Anthropic's Claude AI to extract the relevant price, and Google Sheets API to update the spreadsheet.

## Features

- Searches for current subscription prices of various services in Turkey
- Uses Anthropic's Claude AI to extract accurate price information from search results
- Automatically updates a Google Sheet with the latest prices
- Supports multiple services including Netflix, Disney+, Amazon Prime, and more

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js installed on your local machine
- A Google Cloud Project with Custom Search API and Sheets API enabled
- An Anthropic API key
- A Google Service Account with access to the target Google Sheet

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/expense-update.git
   cd expense-update
   ```

2. Install the dependencies:

   ```
   pnpm install
   ```

3. Set up your environment variables:
   Create a `.env` file in the root directory with the following contents:

   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CX=your_google_custom_search_engine_id
   GOOGLE_SHEETS_ID=your_google_sheet_id
   ```

4. Place your Google Service Account key file (sheet-info.json) in the root directory.

## Usage

To run the script:

```
pnpm start
```

The script will search for prices of the specified services, extract the relevant information, and update the Google Sheet accordingly.

## Configuration

You can modify the list of services and their corresponding row numbers in the `services` array within `app.ts`.

## Dependencies

- @anthropic-ai/sdk: For interacting with Claude AI
- axios: For making HTTP requests
- dotenv: For loading environment variables
- googleapis: For interacting with Google APIs

## License

This project is licensed under the MIT License.

## Contributing

Contributions to this project are welcome. Please ensure to update tests as appropriate.

## Support

If you encounter any problems or have any questions, please open an issue in the GitHub repository.
