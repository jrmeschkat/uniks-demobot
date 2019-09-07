import { BotFrameworkAdapter } from 'botbuilder';
import * as restify from 'restify';
import { UniksBot } from './bot';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';
import { config } from 'dotenv';
import { IQnAService, BotConfiguration, ILuisService } from 'botframework-config';

config();

const botConfig = BotConfiguration.loadSync('./jrmbot.bot', process.env.BOT_FILE_SECRET);

let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening on ${server.url}`);
});

const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const qnaConfig = botConfig.findServiceByNameOrId('qna') as IQnAService;

const qnaMaker: QnAMaker = new QnAMaker({
  knowledgeBaseId: qnaConfig.kbId,
  endpointKey: qnaConfig.endpointKey,
  host: qnaConfig.hostname
});

const luisConfig = botConfig.findServiceByNameOrId('luis') as ILuisService;

const luis = new LuisRecognizer({
  applicationId: luisConfig.appId,
  endpointKey: luisConfig.subscriptionKey,
  endpoint: luisConfig.getEndpoint()
});

const echo: UniksBot = new UniksBot(qnaMaker, luis);

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async context => {
    await echo.onTurn(context);
  });
});
