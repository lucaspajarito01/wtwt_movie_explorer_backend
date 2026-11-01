import passport from "passport";
import passportJwt from "passport-jwt";
import config from "./env.js";
import { userRepository } from "../container.js";

// Necesitamos desestrucutarlo, ya que como tal es CommonJS
const { Strategy: JwtStrategy, ExtractJwt } = passportJwt;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret,
    algorithms: ["HS256"],
};

passport.use(
    new JwtStrategy(options, async (payload, done) => {
        try {
            const user = await userRepository.findById(payload.sub);

            // I el usuario ha sido eliminado o la cuenta esta inactuva, el token deja de servir
            if (!user || !user.isActive()) return done(null, false);

            done(null, user);
        } catch (err) {
            done(err, false);
        }
    }),
);

export default passport;
