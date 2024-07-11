const User = require("./models/userModel.js")
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;
module.exports= function(passport){
    passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
        try {
            const user = await User.findOne({ token: jwt_payload.sub }).exec();
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (err) {
            return done(err, false);
        }
    }))};