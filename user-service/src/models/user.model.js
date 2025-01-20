import moongose from "mongoose";
import argon2 from "argon2"

const UserSchema = new moongose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        lowercase:true
    },
    password: {
        type: String,
        required: true
    },
    createdAT: {
        type: Date,
        default: Date.now
    }
},{timestamps: true})

UserSchema.pre("save", async function(next) {
    if(this.isModified('password')){
        try {
            
            this.password = await argon2.hash(this.password)
            next();
        } catch (error) {
            
          return   next(error)
        }
    }
})  


UserSchema.methods.comparePassword = async function (password) {
    try {
        
       
       
        
       return await argon2.verify(this.password, password);
    } catch (error) {
        throw new Error("Password verification failed");
    }
};

UserSchema.index({username:'text'})
export const User = moongose.model("User", UserSchema)