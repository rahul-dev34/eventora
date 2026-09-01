const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

const protect = async (req , res , next)=>{
    const token = req.headers.authorization
    if(!token){
        return res.json({
            message : 'token nhi h'
        })
    }
    const actualToken = token.split(' ')[1]
    const decoded = jwt.verify(actualToken,process.env.JWT_SECRET)
    console.log("Decoded token:", decoded);
    req.user = decoded 
    next()
}

const admin = async(req,res,next)=>{
    if(req.user && req.user.role ==='admin'){
        next()
    }
}
 
module.exports= {protect , admin}