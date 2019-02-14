/**
 * Backend starting point
 **/

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import cors from 'cors';
import passport from '../helpers/local-passport.mjs';
import mongooseDB from '../db/mongoose-db.mjs';
import {isProduction} from '../../helpers/isProduction.mjs';
import router from '../routes/index.mjs';
import timebasedContractService from '../web3/timebased-contract-service.mjs';
import {getJournal} from '../db/journal-service.mjs';
import uploadRouter from '../routes/file-upload.routes.mjs';
import {setupWeb3Interface} from '../web3/web3InterfaceSetup.mjs';
import {configEmailProvider} from '../email/index.mjs';

if (!isProduction) {
  dotenv.config();
}

let platformContract;
let tokenContract;
let contractOwner;
let app;
let server;

const __dirname = path.resolve();

export default {
  setupApp: async () => {
    app = express();

    // Serve static files from the React app
    if (isProduction()) {
      app.use(express.static(path.join(__dirname, '/build')));
    }


    /** Parser **/
    //Parses the text as URL encoded data
    app.use(
      bodyParser.urlencoded({
        extended: true
      })
    );

    const MongoStore = connectMongo(session);
    app.use(
      session({
        secret: 'eureka secret snippet', //TODO change to env variable
        //secret: process.env.DB_USER,
        resave: false,
        //stores session into DB
        store: new MongoStore({
          mongooseConnection: mongooseDB.connection
        }),
        saveUninitialized: false,
        name: 'eureka.sid',
        cookie: {maxAge: 24 * 3600000, secure: false, httpOnly: false}
      })
    );

    app.use(
      cors({
        credentials: true,
        origin: [
          'http://localhost:3000',
          'https://eureka-base58-converter.herokuapp.com',
          'https://eurekaplatform.herokuapp.com'
        ]
      })
    );

    /** Passport setup **/
    app.use(passport.initialize());
    app.use(passport.session());

    /** Web3 Interface: SC Events Listener, Transaction Listener**/
    [platformContract, tokenContract] = await setupWeb3Interface();
    contractOwner = (await getJournal()).contractOwner;

    /**
     * Config and set Email Provider SendGrid (API key as env variable)
     */
    configEmailProvider();

    /** Timebased contract service**/
    // TODO activate it again for checking
    timebasedContractService.start(platformContract, contractOwner);

    //set global variable isAuthenticated -> call ir everywhere dynamically
    app.use(function(req, res, next) {
      res.locals.isAuthenticated = req.isAuthenticated();
      next();
    });

    //Parses the text as JSON and exposes the resulting object on req.body.
    app.use(bodyParser.json());
    app.use('/api', router);
    app.get('/fileupload', uploadRouter);

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    if (isProduction()) {
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname + '/build/index.html'));
      });
    }
  },

  listenTo: port => {
    server = app.listen(port || 8080);
  },

  close: async () => {
    await timebasedContractService.stop();
    return new Promise(resolve => {
      server.close(() => {
        resolve();
      });
    });
  }
};
