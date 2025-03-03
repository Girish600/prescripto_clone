import jwt from "jsonwebtoken";

// Doctor authentication middleware

const authDoctor = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const doctorToken = authorization && authorization.split(" ")[1];

    if (!doctorToken) {
      return res
        .status(401)
        .send({ success: false, message: "Not Authorized. Please log in again." });
    }

    const decoded = jwt.verify(doctorToken, process.env.SECRET_KEY);

    // Attach user ID to req.user instead of req.body
    req.doc = { id: decoded.id };

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).send({ success: false, message: "Invalid token. Please log in again." });
  }
};

export default authDoctor;