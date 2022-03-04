import { Request, Response } from 'express';

import * as express from 'express';

import * as bodyParser from 'body-parser';
import { insertText } from '../cabinet-core/utils/insert-text';
import { CabinetNode, Card } from 'cabinet-node';
import * as cors from 'cors';
import { Server } from 'http';
import { getCurrentlyUsedCards } from '../cabinet-core/utils/get-current_cards';
import { InsertOption } from '../cabinet-core/types/insert-option';



export class CabinetNodeApi {

  server: Server | undefined;
  app = express();
  cabinetNode: CabinetNode;
  port = '18008';
  constructor(cabinetNode: CabinetNode) {
    this.cabinetNode = cabinetNode;

    this.init(cabinetNode);

  }

  async init(cabinetNode: CabinetNode) {


    // json body parser
    this.app.use(bodyParser.json());
    // allow cors

    this.app.use(cors({
      origin: '*'
    }));

    // hello world
    this.app.get('/', (req: Request, res: Response) => {
      res.send('Hello World!');
    });

    // insert card cci into current cursor
    this.app.post('/addcards', function (request: Request, response: Response) {
      console.log(request.body);      // your JSON
      response.send(request.body);    // echo the result back

      const cards = (request.body as Card[]).map(card => {
        return Object.assign(new Card(), card);
      });
      console.log(cards);

      const opt = getInsertOption(request);

      cabinetNode.addCards(cards);
      cards.forEach(card => {
        insertText(card.getCci().toCciMarker(), opt);
      });

      response.send(cards.length);
    });


    const getInsertOption = (request: Request): InsertOption => {
      console.log(request.body);

      const firstLineText = request.query.firstLineText?.toString() ?? '';
      const linesBefore = parseInt(request.query.linesBefore as string, 10);
      const linesAfter = parseInt(request.query.linesAfter as string, 10);
      const select = Boolean(request.query.select);
      return {
        firstLineText,
        linesBefore,
        linesAfter,
        select
      };
    };

    //  insert text into current cursor
    this.app.post('/insert', async function (request: Request, response: Response) {
      console.log(request.query);      // your JSON
      const { text } = request.body;

      const opt = getInsertOption(request);;;
      insertText(text, opt);

      // return `inserted\n${text}`;
      response.json(`inserted\n${text}`);
    });

    // get all cards in current document
    this.app.get('/currentCards', async function (request: Request, response: Response) {
      const cards = getCurrentlyUsedCards();

      console.log(cards);
      response.json(cards);
    });


    this.server = this.app.listen(this.port, () => {
      console.log(`Cabinet Api listening at http://localhost:${this.port}`);
    })


  }

  stopServer() {
    if (this.server) {
      this.server.close();
    }
  }


}
