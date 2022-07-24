/* eslint-disable no-console */
import express from 'express';
import { PrismaClient, User } from '@prisma/client';
import cors from 'cors';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import authMiddleware from './authMiddleware';

const prisma = new PrismaClient();
const server = express();
server.use(cors());
server.use(express.json());
// server.get('/product', async (request, response) => {
//   const products = await prisma.product.findMany();
//   console.log(products);
//   return response.json(products);
// });
server.post('/register', async (request, response) => {
  const { email, name, password } = request.body as User;
  const hashedPassword = await hash(password, 5);
  const user = await prisma.user.create({ data: { email, name, password: hashedPassword } });
  return response.status(201).json(user);
});

server.post('/login', async (request, response) => {
  const { email, password } = request.body as User;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return response.status(401).json({ message: 'Wrong email or password.' });
  }
  const validPassword = await compare(password, user.password);
  if (!validPassword) {
    return response.status(401).json({ message: 'Wrong email or password.' });
  }
  const token = sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '7d',
  });
  return response.json({ token });
});
server.get('/user/profile', authMiddleware, async (request, response) => {
  const { userId: id } = request;
  const user = await prisma.user.findUnique({ where: { id } });
  return response.json(user);
});

// server.delete('/product/:id', async (request, response) => {
//   const { id } = request.params;
//   await prisma.product.delete({ where: { id: parseInt(id, 10) } });
//   return response.status(204).json();
// });

server.listen(3333, () => {
  console.log('Agora foi');
});
