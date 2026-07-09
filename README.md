# Backend AI Chatbot

A simple Node.js backend that forwards prompts to Google Gemini via the `@google/generative-ai` package and returns generated text responses.

## Project Structure

- `index.js`: Express server and `/gemini` POST endpoint.
- `responceGen.js`: Handles prompt requests and formats the response.
- `gemini/index.js`: Configures the Google Gemini model using the API key.
- `package.json`: Project dependencies and metadata.

## Requirements

- Node.js 18+ (or compatible current LTS)
- npm
- Google Gemini API key

## Setup

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

4. Start the server:

```bash
node index.js
```

The server listens by default on `http://localhost:3000`.

## API

### POST `/gemini`

Send a JSON payload containing a `prompt` field. The backend sends this prompt to the configured Gemini model and returns a JSON response.

#### Request

- Method: `POST`
- URL: `/gemini`
- Headers:
  - `Content-Type: application/json`

```json
{
  "prompt": "Write a short summary of the benefits of using AI for customer support."
}
```

#### Response

On success, the server returns a JSON object with `success: true` and the model output in `data`.

```json
{
  "success": true,
  "data": "AI can improve customer support by providing fast, consistent answers, automating repetitive tasks, and freeing human agents to handle complex issues."
}
```

On error, the server returns a JSON object with `success: false` and an error message.

```json
{
  "success": false,
  "message": "Error generating response"
}
```

## Example cURL

```bash
curl -X POST http://localhost:3000/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Tell me about the advantages of asynchronous programming."}'
```

## Notes

- The backend expects the request body to be JSON.
- The code uses `@google/generative-ai` configured for the `gemini-2.5-flash` model.
- Update `env` and model settings in `gemini/index.js` as needed.

## Troubleshooting

- If the server fails to start, verify `GEMINI_API_KEY` is set in `.env`.
- If responses are empty or invalid, check the Gemini API usage and quota.
