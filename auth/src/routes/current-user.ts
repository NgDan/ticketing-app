import express from 'express';
import { currentUser } from '@ng-ticketing-app/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  // if req.currentUser is undefined return null instead of undefined
  res.send({ currentUser: req.currentUser || null });
});

// we're renaming it as we export it
export { router as currentUserRouter };
