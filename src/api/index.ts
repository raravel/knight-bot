/*
 * index.ts
 * Created on Fri Jan 07 2022
 *
 * Copyright (c) raravel. Licensed under the MIT License.
 */
import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';

import oauth from './oauth';

const port = 8807;
const app: Application = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/oauth', oauth);

app.listen(port, () => console.log('Running express on port ', port));
