export {};

const express = require('express');
const path = require('path');
const router = require('./routers/main-app.router')
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,
   optionSuccessStatus:200,
};

const app = express();
const port = 80;

app.use(cors(corsOptions));
app.use(express.static(__dirname))
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use('/', router);

app.get('/', (req: any, res:any) => {
   res.sendFile(path.resolve(__dirname, '../', 'differ-web-app', 'public', 'index.html'));
});

app.listen(port, () => {
   console.log(`Сервер запущен на порту ${port}`);
});

