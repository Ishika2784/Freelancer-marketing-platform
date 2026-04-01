const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/Freelancer');

const authRoute = require('./routes/authRoute');
app.use('/api/auth', authRoute);

const paymentRoute = require('./routes/paymentRoute');
const userRoute = require('./routes/userRoute');
app.use('/api/payment', paymentRoute);
app.use('/api/user', userRoute);
const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const Port =5000;

app.listen(Port,()=>{
    console.log(`Server is running on port ${Port}`);
});