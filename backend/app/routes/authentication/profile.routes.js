const express = require('express');
const router = express.Router();
const User = require('../../models/user.model')

router.post('/update-profile', async (req, res, next) => {
    let {profileImage, profileBio} = req.body
    let userID = req.user._id 
    let profileUser = await User.findOne({_id : userID}) 
    console.log(profileUser)
    if(profileImage){
        profileUser.profilepic = profileImage
    }

    if(profileBio){
        profileUser.profilebio =  profileBio
        
    }
    let response = await profileUser.save()
    req.session.passport.user=response;
    return res.status(200).json({user:response});
});



module.exports = router;