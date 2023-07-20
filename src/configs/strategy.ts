//setup passport js login strategy 
import passport from 'passport';
import {Strategy as googleStrategy} from 'passport-google-oauth20';
import {Strategy as facebookStrategy} from 'passport-facebook';

import * as dotenv from 'dotenv';
dotenv.config();






passport.use(new googleStrategy({

    clientID:process.env.googleClientId!,
    clientSecret:process.env.googleClientSecret!,
    callbackURL:"https://meroghar-rf5q.onrender.com/auth/v1/google-callback"

    },async(accessToken,refreshToken,profile,done)=>{
        try{
            const{_json:{name,email,picture}}=profile
            console.log(name,email,picture);
            //will be attached to req.user
            done(null,{userName:name,email,profile_Img:picture})
        }catch(e){
            console.log(e);
        }
    }))



passport.use(new facebookStrategy({

        clientID:process.env.facebookClientId!,
        clientSecret:process.env.facebookClientSecret!,
        callbackURL:"https://meroghar-rf5q.onrender.com/auth/v1/facebook-callback",
         profileFields: ['id', 'displayName', 'photos', 'email']
        },async(accessToken,refreshToken,profile,done)=>{
            try{
            const profile_Img=profile.photos![0].value
            const{_json:{name,id,}}=profile
           
            done(null,{userName:name,email:id,profile_Img})
            }catch(e){
                console.log(e);
            }
        }))    