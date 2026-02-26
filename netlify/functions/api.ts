import app from '../../app.ts';
import serverless from "serverless-http";



export const handler = serverless(app);


