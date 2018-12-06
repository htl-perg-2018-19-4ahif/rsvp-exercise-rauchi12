import * as loki from 'lokijs';
import * as express from 'express';
import {CREATED, BAD_REQUEST, UNAUTHORIZED} from 'http-status-codes';
import * as basic from 'express-basic-auth';


let app = express();
app.use(express.json());

const auth = basic({ users: { admin: 'root' }});
const db = new loki(__dirname + '/db.dat', {autosave: true, autoload: true});
let visitors = db.getCollection('visitors');
if (!visitors) {
  visitors = db.addCollection('visitors');
}

let partys = db.getCollection('partys');
if(!partys){
  partys = db.addCollection('Partys');
}

partys.insert({name: 'Christmas Party', location:'My House', date:'24.12.2018'})
partys.insert({name: 'Halloween Party', location:'My House', date:'30.12.2018'})


app.get('/party', function (req, res) {
  let help='';
  for(let i=1 ; i<=partys.data.length;i++){
    help+=partys.get(i).name+' '+partys.get(i).location+' '+partys.get(i).date+'\n';
  }
  res.send(help);
});

app.post('/register/:id', function(req, res){
  if(!req.body.firstName || !req.body.lastName){
     res.status(BAD_REQUEST).send("Invalid details!");
  } else {
    let count=0;
    for(let i=1; i<=visitors.data.length;i++){
      if(visitors.get(i).partyID===req.params.id){
        count++;
      }
    }
    if (count < 10) {
      visitors.insert({firstName: req.body.firstName, lastName: req.params.lastName, partyID: req.params.id});
      res.status(CREATED).send('You are signed in for the party');
    } else {
      res.status(UNAUTHORIZED).send('Sorry, max. number of guests already reached');
    }
  }
});

app.get('/guests/:id', auth, function(req,res){
  let help='';
  for(let i=0; i<visitors.data.length;i++){
    if(visitors.get(i).partyID===req.params.id){
      help+=visitors.get(i).firstName+' '+visitors.get(i).lastName+'\n';
    }
  }
  res.send(help);
});

app.listen(8080, function () {
  console.log('app listening on port 8080!');
});
