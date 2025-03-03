import jwt from "jsonwebtoken";

const authAdmin = async (req, res, next) => {
  try {
    // const { adminToken } = req.headers;
    // console.log(adminToken,'adminToken');
    
    const { authorization } = req.headers;
    const adminToken = authorization && authorization.split(" ")[1];
    if (!adminToken) {
      return res
        .status(400)
        .send({ success: false, message: "Not Authrized Login Again" });
    }

    const decoded = jwt.verify(adminToken, process.env.SECRET_KEY);
    // console.log(decoded,'check')

    if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return res
        .status(400)
        .send({ success: false, message: "Not Authrized Login Again" });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: error.message });
  }
};

export default authAdmin;
