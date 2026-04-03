import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express'
import { connectDB } from './config/db.js';
import path from 'path';
import invoiceRouter from './routes/invoiceRouter.js';

const app = express();
const PORT = 3000;

// MIDDLEWARES
app.use(cors());
app.use(clerkMiddleware());
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({limit: '20mb', extended: true}));

// DB
connectDB();

// ROUTES
app.use('/uploads', express.static(path.join(process.cwd(),'uploads')));

app.use('/api/invoice',invoiceRouter);

app.get('/', (req, res)=>{
    res.send('API WORKING');
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});