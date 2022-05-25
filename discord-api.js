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

const exchangeCodeForToken = async (code) => {
    const params = new URLSearchParams();
    params.append('client_id', process.env.CLIENT_ID);
    params.append('client_secret', process.env.CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', 'https://fkipongejlaaachjiaipijmmnhcacbca.chromiumapp.org');
    params.append('scope', 'identify guilds');

    const authResponse = await fetch(`https://discord.com/api/oauth2/token`, {
        method: 'POST',  
        body: params,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        }
    });
    return  authResponse.json();
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

const postSignalToChannel = async (profile, channelId, content) => {
    console.log(profile, channelId, content)
    const webhook = channels.find(channel => channel.id === channelId).webhook;
    const { username, avatar: avatar_url } = profile;

    const response = await fetch(webhook, {
        method: 'POST',
        crossDomain: true,
        body: JSON.stringify({ username, avatar_url, content }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
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