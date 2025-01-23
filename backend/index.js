require('dotenv').config();
const express = require('express');
const cors = require('cors');
const irctcRouter=require('./routes/irctcRoutes')
const commonRouter=require('./routes/commonRoutes')
const flipkartRoutes=require('./routes/flipkartRoutes')

const app = express();
const port = 5000;

const corsOptions = {
  origin: "*", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(irctcRouter);
app.use(commonRouter)
app.use(flipkartRoutes)




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
