import express from "express";
import cors from 'cors';
import { Database } from "./database";
import swaggerUI from 'swagger-ui-express';
import { swaggerDocs } from "./docs";
import { authLogin, authLogout, authRegister } from "./auth";
import { userProfile } from "./user";
import { createPortfolio, openPortfolio, userPortfolios } from "./portfolio";

// Make the server instance
export const app = express();

// Attach a CORS middleware for the server
// Cors is a security mechanism that browsers implement that prevent
// websites from different domain names to communicate to each other
// we need to explicitly enable them to communicate or a browser will block
// all API calls from the frontend to the backend
// More about CORS here: https://www.youtube.com/watch?v=4KHiSt0oLJ0&ab_channel=Fireship
app.use(cors());

// Middleware to parse JSON
app.use(express.json())

// Middleware used to generate automatic REST API documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Intialise database
const database = new Database();
database.connect();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         uid:
 *           type: string
 *           description: The uid of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *       example:
 *         uid: 9ThIGIrYNeSNIVuMa2jGU
 *         username: XStockMaster64X
 */
app.get('/', (req, res) => {
  res.status(200).send('This is the root page. Go to /docs for documentation.')
})

// Get endpoint for getting user data
/**
 * @swagger
 * /user/profile:
 *   get:
 *     tags: [User]
 *     description: Endpoint for fetching a users profile
 *     parameters:
 *      - name: uid
 *        description: The uid of the user
 *        example: 9ThIGIrYNeSNIVuMa2jGU
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the user profile information
 *         schema:
 *             $ref: '#/components/schemas/User'
 *       403:
 *         description: Invalid uid
 */
app.get('/user/profile', async (req, res) => {
  const { uid } = req.query;
  const resp = await userProfile(uid, database);
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  res.status(403).send({ message: 'Invalid uid' });
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     description: Endpoint for logging in a user
 *     parameters:
 *      - name: username
 *        description: The username of the user
 *        example: BobDylan24
 *        in: body
 *        required: true
 *        type: string
 *      - name: password
 *        description: The password of the user
 *        example: My password
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the user token and uid
 *         schema:
 *            type: object
 *            properties:
 *              uid:
 *                type: string
 *                description: The uid of the user
 *              token:
 *                type: string
 *                description: The token of the session
 *            
 *       403:
 *         description: Invalid username and password combination
 */
app.post('/auth/login', async (req, res) => {
  // Get the post parameter
  const { username, password } = req.body;
  const resp = await authLogin(username, password, database);
  // Valid so return token
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  // Invalid so send 403 response
  res.status(403).send({ message: 'Invalid username and password combination' });
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     description: Endpoint for logging out a user
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Token has been invalidated
 *       403:
 *         description: Invalid token
 */
app.post('/auth/logout', async (req, res) => {
  // Get the post parameter
  const { token } = req.body;
  const resp = await authLogout(token, database);
  if (resp) {
    res.status(200).send();
    return;
  }
  res.status(403).send({ message: 'Invalid token' });
})

// Post endpoint for logging into the server
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     description: Endpoint for registering a user
 *     parameters:
 *      - name: username
 *        description: The username of the user
 *        in: body
 *        required: true
 *        type: string
 *      - name: password
 *        description: The password of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Returns the user token and uid
 *         schema:
 *            type: object
 *            properties:
 *              uid:
 *                type: string
 *                description: The uid of the user
 *              token:
 *                type: string
 *                description: The token of the session
 *       403:
 *         description: Username already exists
 */
app.post('/auth/register', async (req, res) => {
  // Get the post parameter
  const { username, password } = req.body;
  const resp = await authRegister(username, password, database);
  // Valid so return token
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  // Invalid so send 403 response
  res.status(403).send({ message: 'username already exists' });
})

// Delete endpoint for removing user from server
/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     tags: [Authentication]
 *     description: Endpoint for deleting a user account
 *     parameters:
 *      - name: token
 *        description: The token of the user
 *        in: body
 *        required: true
 *        type: string
 *     responses:
 *       200:
 *         description: Successfully deleted account
 *       403:
 *         description: Invalid token
 */
app.delete('/auth/delete', async (req, res) => {
  // Get the post parameter
  const { token } = req.body;
})

// Post endpoint for creating a single portfolio
app.post('/user/portfolios/create', async (req, res) => {
  const { token, name } = req.body;
  const resp = await createPortfolio(token, name, database);
  if (resp == null) {
    res.status(400).send({ message: "Invalid name or portfolio name already in use" });
  }
  else if (resp == false) {
    res.status(403).send({ message: "Invalid token" });
  }
  res.status(200).send(resp);
  return;
})

// Get endpoint for getting user portfolios
app.get('/user/portfolios', async (req, res) => {
  const { uid } = req.query;
  const resp = await userPortfolios(uid, database);
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  res.status(403).send({ message: 'Invalid uid' });
})

// Get endpoint for opening single portfolio
app.get('/user/portfolios/open', async (req, res) => {
  const { pid } = req.query;
  const resp = await openPortfolio(pid, database);
  if (resp !== null) {
    res.status(200).send(resp);
    return;
  }
  res.status(403).send({ message: "Invalid pid" });
})