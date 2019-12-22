const express =  require('express');
const bodyParser = require('body-parser');
const slack = require('./main');

let users = [
    {"name": "Temp 222", email: "jepopoh222@topmail.ws", "id": "US17359T9"},
    {"name": "Ferdinand", email: "ferdelirta@desoz.com", "id": "URYTB3C9J"},
];

const app = express();
app.use(bodyParser.json());

app.post("/group", async(req, res) => {
    //console.log(req.body);
    let group = req.body;

    try{
        let groupRes = await slack.createNewGroup( group.name + new Date().getTime());
        let topicRes = await slack.setGroupTopicAndPurpose(groupRes.id, group.topic, group.purpose);
        let addUsers = await slack.addUsers(groupRes.id, users);
        res.status(400).send({
            success: true,
            slackGroupId: groupRes.id,
            name: groupRes.name,
            users: addUsers
        });
    } catch(e) {
        console.error(e);
        res.send(200, {
            success: false,
            error: e
        })
    }
});

app.delete("/group", async(req, res) => {
    let group = req.body;
    try{
        let mesages = await slack.getMessages(group.id);
        let deleteRes = await slack.deleteGroup(group.id);
        res.status(400).send({
            success: true
        });
    } catch(e) {
        console.error(e);
        res.send(200, {
            success: false,
            error: e
        })
    }
});

app.listen(8000,()=>{
    console.log("Listening ...");
})