import { TurnContext } from 'botbuilder';
import { QnAMaker, LuisRecognizer } from 'botbuilder-ai';

export class UniksBot {
  private qnaMaker: QnAMaker;
  private luis: LuisRecognizer;

  constructor(qnaMaker: QnAMaker, luis: LuisRecognizer) {
    this.qnaMaker = qnaMaker;
    this.luis = luis;
  }

  async onTurn(context: TurnContext) {
    if (context.activity.type === 'message') {
      let qnaResults = [];
      // qnaResults = await this.qnaMaker.generateAnswer(context.activity.text);
      if (qnaResults.length > 0) {
        await context.sendActivity(qnaResults[0].answer);
      } else {
        await this.luis
          .recognize(context)
          .then(res => {
            const top = LuisRecognizer.topIntent(res);
            console.log(top + '\t ' + res.entities);
            switch (top) {
              case 'Name':
                const firstname = res.entities.firstname;
                const lastname = res.entities.lastname;
                context.sendActivity(`Hello ${firstname ? firstname : ''} ${lastname ? lastname : ''}`);
                break;

              default:
                context.sendActivity("Sorry, I didn't understood that.");
                break;
            }
          })
          .catch(console.error);
        // await
      }
    } else {
      await context.sendActivity(`${context.activity.type} event detected`);
    }
  }
}
