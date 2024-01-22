import * as fs from 'fs';
import * as readline from 'readline/promises';
import dotenv from 'dotenv';
import { ChatBotSession } from './ChatBotSession';

dotenv.config();

const filePath = './car_details_100.csv';
const isStatusFeatureEnabled = true;
const isSuggestionFeatureEnabled = false;

async function main() {
  const carsData = await fs.promises.readFile(filePath, 'utf8');

  const chatBot = new ChatBotSession(
    [
      'You are the sale assistant in cars dealer "Royal Cars For All. You first greet the client and suggest your help.',
      'You are supposed to help clients to choose the right car by their needs. Be more proactive, ask followup questions.',
      'Feel free to ask additional questions to better understand which car have the best fit to the client.',
      "Don't ask open questions, try to suggest some options to client.",
      `CSV data of available cars: """${carsData}"""`,
      'When client agree to buy a particular car ask for name, email and phone number and say sales manager will contact soon.',
    ],
    1,
    'gpt-4-1106-preview',
  );

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let message = 'Hi!';

  while (true) {
    const answer = await chatBot.sendMessage(message);
    console.log(`\x1b[33mAssistant:\x1b[0m ${answer}`);

    // generate conversation status
    if (isStatusFeatureEnabled) {
      const status = await chatBot.sendSystemMessage(
        'Generate JSON object with properties: ' +
          '"hasClientConfirmedPurchase", ' +
          '"hasClientProvidedNameAndPhone", ' +
          '"clientName", ' +
          '"clientPhone", ' +
          '"carType",' +
          '"carBrand",' +
          '"carModel".',
        'json_object',
        0,
      );
      console.log(`Conversation status: \x1b[36m${status}\x1b[0m`);
    }

    // generate response suggestion
    if (isSuggestionFeatureEnabled) {
      const suggestions = await chatBot.sendSystemMessage(
        'Generate json object with "predictions" property, ' +
          "which is 3 items long array of most probably client's questions.",
        'json_object',
        1,
      );
      console.log(`Suggestions: \x1b[35m${suggestions}\x1b[0m`);
    }

    message = await rl.question('\x1b[92mYou: \x1b[0m');
  }
}

main();
