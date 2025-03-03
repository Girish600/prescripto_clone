import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization && authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .send({ success: false, message: "Not Authorized. Please log in again." });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Attach user ID to req.user instead of req.body
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).send({ success: false, message: "Invalid token. Please log in again." });
  }
};

export default authUser;