const express = require('express')
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const user = require('./models/user');
const { escapeXML } = require('ejs');
const env = require('dotenv')
env.config(); 


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


app.get('/', (req,res) =>{
    res.render('index')
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/register', async (req,res) =>{
    const { email, username, name, password, age } = req.body;

    let user =  await userModel.findOne({email});
    if(user) return res.status(500).send('User already exists');

    const hashedPassword = await bcrypt.hash(password,4);
    await userModel.create({
        username,
        name,
        email,
        age,
        password:hashedPassword
    })

    
    res.redirect('login')
})



app.post('/login', async (req,res) =>{
    const { email, password } = req.body;
    
    let user =  await userModel.findOne({email});
    if(!user) return res.status(500).send('something went wrong');
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if(passwordMatch && user){
        const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);
        res.cookie('token', token)
        res.redirect('/profile')
    }
    else{
        res.send('login failed')
    }
})

app.get('/logout', (req,res)=>{
    res.cookie('token'," ");
    res.redirect('/login')
})

function authMiddleware(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const verifiedUser = jwt.verify(token,  process.env.JWT_SECRET);
        req.user = verifiedUser;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.redirect('/login');
    }
}

app.get('/profile', authMiddleware, async(req, res) => {
  try{
    const foundUser = await userModel.findOne({ _id: req.user.userId }).populate('posts');
    res.render('profile', {foundUser})
  }
  catch(e){
    console.log(e)
    res.redirect('/login')
  }
});


app.post('/post', authMiddleware, async(req,res)=>{
    let user = await userModel.findOne({_id: req.user.userId})
    const {content} = req.body;
    const post = await postModel.create({
        user:user._id,
        content:content
    })
    user.posts.push(post._id)
    await user.save()
    console.log(post)
    res.redirect('/profile')
})

app.get('/like/:id', authMiddleware, async(req, res) => {
    try{
    const post = await postModel.findOne({ _id: req.params.id });
    if(post.likes.indexOf(req.user.userId) === -1){
        post.likes.push(req.user.userId);
    }
    else{
        post.likes.pop(req.user.userId);
    }
    await post.save()
    req.redirect('/profile')
    }
    catch(e){
      console.log(e)
      res.redirect('/profile')
    }
  });
  


app.listen(3000)