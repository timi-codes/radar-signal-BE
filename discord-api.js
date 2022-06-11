const channels = require('./data/channels.json');
const fetch = require('node-fetch');


const isUserARadar = async (access_token) => {
    const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds`, {
        crossDomain: true,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    });
    const guilds =  await guildResponse.json();
    const guild = guilds.find(guild => guild.id === process.env.GUILD_ID);
    return Boolean(guild);
};

const exchangeCodeForToken = async (redirect_uri) => {
    try {

        const redirect = redirect_uri.split('?')[0];
        const code = redirect_uri.split('=')[1];
        console.log(`auth code: ${code}`)
        const params = new URLSearchParams();
        params.append('client_id', process.env.CLIENT_ID);
        params.append('client_secret', process.env.CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirect);
        params.append('scope', 'identify guilds');
    
        console.log(`params: ${params}`)
    
        const authResponse = await fetch(`https://discord.com/api/oauth2/token`, {
            method: 'POST',  
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
        });
        console.log(`authResponse: ${await authResponse.json().toString()}`)
        return  authResponse.json();
    } catch(err) {
        console.log(err);
        return res.status(500).send({error: err});
    }
}

const getUserInfo = async (access_token) => {
    const response = await fetch(`https://discord.com/api/oauth2/@me`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': `Bearer ${access_token}`
        }
    });
    return response.json();
}

const postSignalToChannel = async (profile, channelId, content, url) => {
    console.log(profile, channelId, content, url)
    const webhook = channels.find(channel => channel.id === channelId).webhook;
    const { username, avatar: avatar_url } = profile;

    const response = await fetch(webhook, {
        method: 'POST',
        crossDomain: true,
        body: JSON.stringify({ 
            username, 
            avatar_url, 
            content: `${url}\n\n ${content}\n\n ${new Date()}`
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}



module.exports = {
    isUserARadar,
    exchangeCodeForToken,
    getUserInfo,
    postSignalToChannel
}