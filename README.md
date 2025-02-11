# Insta-Bot

This project is an Instagram bot that collects and stores messages for scheduling and automatic responses. It uses various APIs and services to process and respond to messages.

## Features

- Collects and stores Instagram messages
- Processes messages using OpenAI API
- Sends responses via Messenger API
- Uses MongoDB for data storage

## Project Structure
v1/
    -- adapters
    -- controllers
    -- repository
    -- routes
    -- services


## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/insta-bot.git
    cd insta-bot
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/14) file in the root directory and add your environment variables:
    ```env
    PORT=3001
    VERIFY_TOKEN=your_verification_token
    PAGE_ACCESS_TOKEN=your_page_access_token
    OPENAI_API_KEY=your_openai_api_key
    MONGO_URI=your_mongo_uri
    ```

## Usage

1. Start the server:
    ```sh
    npm start
    ```

2. The server will be running on the port specified in the [.env](http://_vscodecontentref_/15) file (default is 3001).

## Endpoints

- `GET /privacidade`: Returns the privacy policy HTML page.
- `GET /webhook`: Webhook verification endpoint for Instagram.
- `POST /webhook`: Endpoint to receive messages from Instagram.

## Services

- [openAIService](http://_vscodecontentref_/16): Processes messages using OpenAI API.
- [metaAPIService](http://_vscodecontentref_/17): Sends messages via Messenger API.

## Repositories

- [messagesRepository](http://_vscodecontentref_/18): Handles message storage.
- [messagesLockTableRepository](http://_vscodecontentref_/19): Manages message lock table.
- [messagesHistoryRepository](http://_vscodecontentref_/20): Stores message history.

## License

This project is licensed under the ISC License.
