import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  res.send('Hi there!');
});

// we're renaming it as we export it
export { router as signoutRouter };
