const mongoose = require('mongoose');
const env = require('dotenv')
env.config();

mongoose.connect(process.env.MONGO_URL);

const userSchema = ({
    name:String,
    username:String,
    age:Number,
    email:String,
    password:String,
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }]
})

module.exports = mongoose.model('user',userSchema);