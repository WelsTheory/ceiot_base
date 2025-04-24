const express = require("express");
const bodyParser = require("body-parser");
const {MongoClient} = require("mongodb");
const PgMem = require("pg-mem");

const db = PgMem.newDb();

    const render = require("./render.js");
// Measurements database setup and access

let database = null;
const collectionName = "measurements";

async function startDatabase() {
    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";	
    const connection = await MongoClient.connect(uri, {useNewUrlParser: true});
    database = connection.db();
}

async function getDatabase() {
    if (!database) await startDatabase();
    return database;
}

async function insertMeasurement(message) {
    const {insertedId} = await database.collection(collectionName).insertOne(message);
    return insertedId;
}

async function getMeasurements() {
    return await database.collection(collectionName).find({}).toArray();	
}

// API Server

const app = express();

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static('spa/static'));

const PORT = 8080;

// Borrar dispositivo
app.delete('/device',  function (req, res) {
	console.log(req.body)
    db.public.none("DELETE FROM devices WHERE device_id = '"+req.body.id+"'");
	res.send("Device was deleted");
});


app.post('/measurement', function (req, res) {
    //const { id,key, t,bp} = req.body;
    const timestamp = new Date().toISOString();
    const devices = db.public.many("SELECT * FROM devices");
    console.log("device id: " + req.body.id + " key: " + req.body.key + " BMP280 temperature : " + req.body.t + " BMP280 pressure: " + req.body.p + " Timestamp: " + timestamp);	
    const {insertedId} = insertMeasurement({id:req.body.id, key:req.body.key, bmp280_t:req.body.t, bmp280_p:req.body.p, timestamp:timestamp});
	res.send("received measurement into " +  insertedId);
});

app.post('/device', function (req, res) {
    const timestamp = new Date().toISOString();
     var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.body.id+"'");
     if(device.length) {
        db.public.none("UPDATE devices SET t = '" + req.body.t + "', p = '" + req.body.p + "', time = '" + timestamp +"' WHERE device_id = '" + req.body.id + "'");
        //db.public.none("UPDATE devices SET t = $1, p = $2, time = $3 WHERE device_id = $4",[req.body.t, req.body.p, timestamp, req.body.id]);
         console.log("Received UPDATE device " + req.body.id + " los valores de temp= " + req.body.t + " y de presion= " + req.body.p + " tiempo: " + timestamp);         
          res.send("Received UPDATE device");    
     } else {
         // Insert
         db.public.none("INSERT INTO devices VALUES ('"+req.body.id+ "', '"+req.body.name+"', '"+req.body.key+"', '"+req.body.t+"','"+req.body.p+"','"+timestamp+"')");
         console.log("device id : " + req.body.id + "name : " +req.body.name + " key : " + req.body.key + " temp : " + req.body.t + "pres : " + req.body.p + " tiempo: " + timestamp);
         res.send("received new device");
     }	
});

app.get('/web/device', function (req, res) {
	var devices = db.public.many("SELECT * FROM devices").map( function(device) {
		console.log(device);
		return '<tr><td><a href=/web/device/'+ device.device_id +'>' + device.device_id + "</a>" +
			       "</td><td>"+ device.name+"</td><td>"+ device.key+"</td><td>"+ device.t+"</td><td>"+ device.p+"</td><td>"+device.time+"</td></tr>";
	   }
	);
	res.send("<html>"+
		     "<head><title>Sensores</title></head>" +
		     "<body>" +
		        "<table border=\"1\">" +
		           "<tr><th>id</th><th>name</th><th>key</th><th>t</th><th>p</th><th>time</th></tr>" +
		           devices +
		        "</table>" +
		     "</body>" +
		"</html>");
});

app.get('/web/device/:id', function (req,res) {
    //const timestamp = new Date().toISOString();
    var template = "<html>"+
                     "<head><title>Sensor {{name}}</title></head>" +
                     "<body>" +
		        "<h1>{{ name }}</h1>"+
		        "id  : {{ id }}<br/>" +
		        "Key : {{ key }}" +
                "Temp : {{ t }}" +
                "Pres : {{ p }}" +
                "Time : {{time}}" +
                     "</body>" +
                "</html>";


    var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id,name:device[0].name, key: device[0].key, t:device[0].t, p:device[0].p, time:device[0].time}));
});	


app.get('/term/device/:id', function (req, res) {
    const timestamp = new Date().toISOString();
    var red = "\33[31m";
    var green = "\33[32m";
    var blue = "\33[33m";
    var reset = "\33[0m";
    var template = "Device name " + red   + "   {{name}}" + reset + "\n" +
		   "       id   " + green + "       {{ id }} " + reset +"\n" +
	           "       key  " + blue  + "  {{ key }}" + reset +"\n" +
               "       temp  " + blue  + "  {{ t }}" + reset +"\n" +
               "       pres  " + blue  + "  {{ p }}" + reset +"\n" +
               "       time  " + blue  + " {time}}"  + reset +"\n";
    var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id, name:device[0].name,key: device[0].key, t:device[0].t,p:device[0].p,timestamp:device[0].time}));
});

app.get('/measurement', async (req,res) => {
    res.send(await getMeasurements());
});

app.get('/device', function(req,res) {
    res.send( db.public.many("SELECT * FROM devices") );
});

startDatabase().then(async() => {

    const addAdminEndpoint = require("./admin.js");
    addAdminEndpoint(app, render);

    await insertMeasurement({id:'00', t:'18', h:'78'});
    await insertMeasurement({id:'00', t:'19', h:'77'});
    await insertMeasurement({id:'00', t:'17', h:'77'});
    await insertMeasurement({id:'01', t:'17', h:'77'});
    console.log("mongo measurement database Up");

    db.public.none("CREATE TABLE devices (device_id VARCHAR, name VARCHAR, key VARCHAR, t VARCHAR, p VARCHAR, time VARCHAR)");
    db.public.none("INSERT INTO devices VALUES ('00', 'Fake Device 00', '123456')");
    db.public.none("INSERT INTO devices VALUES ('01', 'Fake Device 01', '234567')");
    db.public.none("CREATE TABLE users (user_id VARCHAR, name VARCHAR, key VARCHAR)");
    db.public.none("INSERT INTO users VALUES ('1','Ana','admin123')");
    db.public.none("INSERT INTO users VALUES ('2','Beto','user123')");

    console.log("sql device database up");

    app.listen(PORT, () => {
        console.log(`Listening at ${PORT}`);
    });
});
