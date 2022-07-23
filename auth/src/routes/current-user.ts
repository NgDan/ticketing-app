import express from 'express';

const router = express.Router();

router.get('/api/users/currentuser', (req, res) => {
  res.send('Hi there!');
});

// we're renaming it as we export it
export { router as currentUserRouter };
