import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  // cookie-parser will attach a delete cookie header
  // to the response if we set it to null

  req.session = null;
  res.send({});
});

// we're renaming it as we export it
export { router as signoutRouter };
