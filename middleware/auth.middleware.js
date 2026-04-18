const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Unauthorized access! Please login." });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden! Invalid or expired token." });
      }

      if (decoded.role !== "admin") {
        return res.status(403).send({ message: "Access denied! Admins only." });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).send({ message: "Auth validation failed", error: error.message });
  }
};

module.exports = { verifyAdmin };