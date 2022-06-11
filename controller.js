const Profile = require('./model');
const jwt = require('jsonwebtoken');
const channels = require('./data/channels.json');
const  {  
    isUserARadar, 
    exchangeCodeForToken, 
    getUserInfo, 
    postSignalToChannel 
} = require('./discord-api')



const getAuthToken = async(req, res) => {
    try {
        const { redirect_uri } = req.body
        console.log(`redirect_uri: ${redirect_uri}`)
        const { access_token, refresh_token, ...rest } = await exchangeCodeForToken(redirect_uri);
        console.log(`access_token: ${access_token} refresh_token: ${rest}`)

        const isARadar = await isUserARadar(access_token);
        if(!isARadar) {
            return res.status(401).send({error: 'You  are not yet a member  of Radar Server. Please join the server'});
        }

        const { user } = await getUserInfo(access_token);
        await Profile.findOneAndUpdate(
            { discordId: user.id }, 
            { 
                username: `${user.username}#${user.discriminator}`,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
                refresh_token: refresh_token,
                access_token: access_token,
            }, 
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        const token = jwt.sign(
            {
                userId: user.id,
                username: `${user.username}#${user.discriminator}`,
                avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            },
            process.env.JWT_SECRET,
        )

        return res.send({
            token,
            userId: user.id,
            username: `${user.username}#${user.discriminator}`,
            avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
            channels: channels.map(({ webhook, ...rest}) => rest)
        });
    }catch(err) {
        console.log(err);
        return res.status(500).send({error: err});
    }
}

const getProfile = async(req, res) => {
    try {
        const profile = req.profile;
        const isARadar = await isUserARadar(profile.access_token);
        if(!isARadar) {
            return res.status(401).send({error: 'You  are not yet a member  of Radar Server. Please join the server'});
        }

        return res.status(200).send({
            userId: profile.discordId,
            username: profile.username,
            avatar: profile.avatar,
            channels: channels.map(({ webhook, ...rest}) => rest)
        })
    } catch(err) {
        console.log(err);
        return res.status(500).send({error: err.message});
    }
}

const submitSignal = async(req, res) => {
    try {
        const { channelId, message, url } = req.body;
    
        const profile = req.profile;

        const isARadar = await isUserARadar(profile.access_token);
        if(!isARadar) {
            return res.status(401).send({error: 'You  are not yet a member  of Radar Server. Please join the server'});
        }
        console.log(profile);
        const response = await postSignalToChannel(profile, channelId, message, url);
        console.log(response);

        return res.send({
            success: true,
            message: "Successfully submitted signal"
        })

    } catch(err) {
        console.log(err);
        return res.status(500).send({error: err.message});
    }
}

module.exports = {
    getAuthToken,
    getProfile,
    submitSignal
}
