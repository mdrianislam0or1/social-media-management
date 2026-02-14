import express from 'express';
import { authRoutes } from '../app/modules/Auth/auth.routes';
import { postRoutes } from '../app/modules/Post/post.routes';
import { userRoutes } from '../app/modules/User/user.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/posts',
    route: postRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
