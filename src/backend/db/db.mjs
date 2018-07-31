import dotenv from 'dotenv';
import {isProduction} from '../../helpers/isProduction.mjs';
import mongo from 'then-mongo/index';

const collections = ['reviews'];

if (!isProduction()) {
  dotenv.config();
}
const url =
  'mongodb://' +
  process.env.DB_USER +
  ':' +
  process.env.DB_PASSWORD +
  '@' +
  process.env.DB_HOST +
  '/' +
  process.env.DB_NAME;

if(isProduction()) {
  url.concat('?ssl=true');
}

const db = mongo(url, collections);

export default db;
