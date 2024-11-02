const mongoose = require('mongoose');
const env = require('dotenv')
env.config();

const postSchema = ({
    userId: [{type: mongoose.Schema.Types.ObjectId, ref:"user"}],
    date: {
        type:Date,
        default:Date.now(),
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }],
    content:String
})

module.exports = mongoose.model('post',postSchema);