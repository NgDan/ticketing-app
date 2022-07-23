import express from 'express';

const router = express.Router();

router.post('api/users/signup', (req, res) => {
  const { email, password } = req.body;

  res.send('Hi there!');
});

// we're renaming it as we export it
export { router as signupRouter };
