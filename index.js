import express from 'express'
import Mongoose from 'mongoose'
import path from 'path'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'











const app = express();



app.use(express.static(path.join(path.resolve(), "public")))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");






const uri = 'mongodb+srv://Dinemo:PnwKacv2tXgTxnZj@cluster0.ikode9m.mongodb.net/';
Mongoose.connect(uri, {
    dbName: "Backend"
}).then(() => {
    console.log("database connnect")
})

const userSchema = new Mongoose.Schema({
    name: String,
    email: String,
    password:String
})


const Users = Mongoose.model("Users", userSchema);

const isAuthenticate = async (req, res, next) => {

    const { token } = req.cookies;


    if (token) {

        const decode = jwt.verify(token, "askdjfhasjkdfhalsjkdfh")
        const userExist = req.user = await Users.findById(
            decode._id
        );
       
        next()
    }
    else {
        res.redirect("/login")
    }
}





app.get("/", isAuthenticate, (req, res) => {
   
    res.render("logout",{name:req.user.name})

})

app.get("/register",  (req, res) => {
   
    res.render("register",)

})
app.get("/login",(req,res)=>{
    res.render("login")
})

app.post("/login", async (req,res)=>{
    const {email, password} =req.body;
    let user = await Users.findOne({email});
    if(!user) return res.redirect("/register")

    const isUser = bcrypt.compare(password,user.password);
    if(!isUser) return res.render("login",{email,message:"Incorrect password"})

    
    const token = jwt.sign({ _id: user._id }, "askdjfhasjkdfhalsjkdfh")

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
})


app.post("/register", async (req, res) => {

    const { name, email ,password } = req.body;

   let user = await Users.findOne({email})
   if(user){
    return  res.redirect("/login")
   }


   const hasPassword = await bcrypt.hash(password,10);


     user = await Users.create({
        name,
        email,
        password:hasPassword,
    })


    const token = jwt.sign({ _id: user._id }, "askdjfhasjkdfhalsjkdfh")

    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
    });
    res.redirect("/");
})


app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/");
})




app.listen(5000, () => {
    console.log("server is running");
})



