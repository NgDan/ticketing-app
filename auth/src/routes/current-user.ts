import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  // req.session can be null or undefined if the cookieSession middleware
  // has not been set
  if (!req.session?.jwt) {
    return res.send({ currentUser: null });
  }

  // if user has tampered the token and if verify finds it invalid it's going to throw an error
  try {
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
    res.send({ currentUser: payload });
  } catch (e) {
    res.send({ currentUser: null });
  }
});

// we're renaming it as we export it
export { router as currentUserRouter };
