const { WebClient } = require('@slack/web-api');
const fs = require('fs');
const request = require('request');

//console.log(process.env.NODE_TOKEN);
// Create a new instance of the WebClient class with the token read from your environment variable
const web = new WebClient(process.env.NODE_TOKEN);
// The current date
const currentTime = new Date().toTimeString();

let createNewGroup = async(groupName) => {
    try {
        let res = await web.groups.create({
            name: groupName
        });
        if(res && res.ok){
            //console.log(res.group);
            return {
                "id": res.group.id,
                "name": res.group.name
            };
        }
        else
            throw Error(`Invaild request. ${res}`);
    } catch(e) {
        console.log(e);
        throw Error('Group could not be created');
    }
};

let setGroupTopicAndPurpose = async(groupId, topic, purpose) => {
    topic = topic|| "";
    purpose = purpose||"";
    try {
        let res = await web.groups.setTopic({
            channel: groupId,
            topic: topic
        });
        if(!res || !res.ok)
            throw Error(`Invaild request. ${res}`);
        res = await web.groups.setPurpose({
            channel: groupId,
            purpose: purpose
        });
        if(!res || !res.ok)
            throw Error(`Invaild request. ${res}`);
    } catch(e) {
        console.log(e);
        throw Error('Topic or purpose could not be added.');
    }
};

let addUsers = async(groupId, users) => {
    try {
        let success = [];
        const promises = users.map(async(user) => {
            let res = await web.groups.invite({
                channel: groupId,
                user: user.id
            });
            //console.log("User ", res);
            success.push({
                user: user.id,
                success: res.ok
            });
        });
        await Promise.all(promises);

        return success;
    } catch(e) {
        console.log(e);
        throw Error('User could not be added.');
    }
};

let getMessages = async(groupId) => {
    try {
        let res = await web.groups.history({
            channel: groupId
        });
        console.log(res);
        if(!res || !res.ok)
            throw Error(`Invaild request. ${res}`);
        else {
            res.messages.forEach(message => {
                console.log(`Type: ${message.type},SubType: ${message.subtype}, Text: ${message.text}`);
                if(message.files){
                    message.files.forEach(file => {
                        console.log(`--- Download file ${file.name}`);
                        request.get({
                            url: file.url_private,
                            headers: {
                              'Authorization': 'Bearer ' + process.env.NODE_TOKEN // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            }
                          }).pipe(fs.createWriteStream('./' + file.name));
                    });
                }
            });
        }
    } catch(e) {
        console.log(e);
        throw Error('Group could not be archived.');
    }
};

let deleteGroup = async(groupId) => {
    try {
        let res = await web.groups.archive({
            channel: groupId
        });
        if(!res || !res.ok)
            throw Error(`Invaild request. ${res}`);
    } catch(e) {
        console.log(e);
        throw Error('Group could not be archived.');
    }
};

module.exports = {
    createNewGroup,
    setGroupTopicAndPurpose,
    addUsers,
    deleteGroup,
    getMessages
}

/*
(async () => {
  // Use the `auth.test` method to find information about the installing user
  const res = await web.auth.test()
  console.log(`API Test response ${JSON.stringify(res)}`);
  // Find your user id to know where to send messages to
  const userId = res.user_id

  // Create new Channel
  let channelRes = await web.channels.join({
      name: "test" + (new Date()).getTime()
  });
  console.log(`Channel Created ${JSON.stringify(channelRes)}`);

  // Post a message
  // Use the `chat.postMessage` method to send a message from this app
  await web.chat.postMessage({
    channel: channelRes.channel.id,
    text: `The current time is ${currentTime}`,
  });

  setTimeout(async()=>{
    let channelHistory = await web.channels.history({
        channel: channelRes.channel.id
    });
    console.log(`Channel history : ${JSON.stringify(channelHistory)}`);
    await web.channels.archive({
        channel: channelRes.channel.id
    })
  }, 10000)
})();
*/