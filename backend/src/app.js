import express from "express";
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use(cookieParser());

app.use(
	cors(
		{
		origin: (origin, callback) => {
		if (!origin) {
		return callback(null, true)
		}
		return callback(null, origin)
		},
		credentials: true,
		}
	)
)





import userRoutes from './routes/user.routes.js';
app.use('/userRoutes', userRoutes);

import moneyRoutes from './routes/money.routes.js';
app.use('/moneyRoutes', moneyRoutes);





import swaggerUi from 'swagger-ui-express'
import fs from 'fs';


const swaggerData = JSON.parse(fs.readFileSync('./swagger-output.json', 'utf-8'));



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerData));





export default app;