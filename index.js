require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.port || 4000;

const app = express();
app.use(cors());
app.use(express.json());
// app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('client server ok')
})

app.listen(port, () => {
    console.log('port is running:', port);
})

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@express-explore.use1c.mongodb.net/?retryWrites=true&w=majority&appName=express-explore`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const serviceCollection = client.db('pokids').collection('services');
        const bookedCollection = client.db('pokids').collection('booked');

        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await serviceCollection.findOne(query);
            res.send(result);
            
          })

        app.get('/services', async(req, res)=>{
            const cursor = await serviceCollection.find().toArray();
            res.send(cursor)
        });

        app.post('/add-service', async (req, res) => {
            const result = req.body;
            const query = await serviceCollection.insertOne(result);
          })

        app.post('/booked-service', async (req, res) => {
            const result = req.body;
            const query = await bookedCollection.insertOne(result);
        })


    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);