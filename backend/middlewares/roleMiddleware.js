const jwt = require('jsonwebtoken');

const roleMiddleware = (role)=>{
    return(req,res,next) => {
        try{
            if(!req.user){
                return res.status(401).json({ message: 'Unauthorized' });
            }
            if(!allowedRoles.includes(req.user.role)){
                return res.status(403).json({ message: 'Access denied' });
            }
            next();
        }catch(error){
            console.log("Error in role middleware",error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };
};

module.exports = roleMiddleware;


