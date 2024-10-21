require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.port || 5000;

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
        
        const serviceCollection = client.db('pokids').collection('services');
        const bookedCollection = client.db('pokids').collection('booked');

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await serviceCollection.findOne(query);
            res.send(result);

        })

        app.get('/services', async (req, res) => {
            const page = parseInt(req.query.page) - 1;
            const size = parseInt(req.query.size);
            const search = req.query.search;
            let query = {
                service_name: {$regex: search, $options: 'i'}
            }
            
            const skip = page * size;
            
            const cursor = await serviceCollection.find(query).skip(skip).limit(size).toArray();
            res.send(cursor);
        });

        app.get('/count-services', async (req, res) => {
            const search = req.query.search;
            let query = {
                service_name: {$regex: search, $options: 'i'}
            }
            const count = await serviceCollection.countDocuments(query);
            
            res.send({count})
        });

        app.get('/my-services', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (req.query?.email) {
                query = { email: email }
            }

            const cursor = await serviceCollection.find(query).toArray();
            res.send(cursor);

        })

        app.get('/booked-service', async (req, res) => {
            const email = req.query.email;

            let query = {};
            if (req.query?.email) {
                query = { 'data.my_email': email }
            }
            const cursor = await bookedCollection.find(query).toArray();
            res.send(cursor);

        })

        app.post('/add-service', async (req, res) => {
            const query = req.body;
            const result = await serviceCollection.insertOne(query);
            res.send(result)
        })

        app.post('/booked-service', async (req, res) => {
            const result = req.body;
            const query = await bookedCollection.insertOne(result);
            res.send({ message: 'Booked Service' })
        })

        app.delete('/my-services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            console.log(result);
            res.send(result)
        })

        // Update 
        app.patch('/update-service/:id', async (req, res) => {
            const id = req.params.id;
            
            const service = req.body;
            const { service_name, service_area, price, description, image_url, email, displayName, photoURL } = service;

            const filter = { _id: new ObjectId(id) };
            const option = { upsert: true };
            const updateService = {
                $set: {
                    service_name, service_area, price, description, image_url, email, displayName, photoURL 
                }
            }

            const cursor = await serviceCollection.updateOne(filter, updateService, option);
            res.send(cursor);
        })



    } finally {
        
    }
}
run().catch(console.dir);