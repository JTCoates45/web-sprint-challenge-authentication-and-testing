const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');

test('sanity', () => {
  expect(true).toBe(true);
})

test('check env var', async () => {
  expect(process.env.NODE_ENV).toBe('testing');
})

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
})

beforeEach(async () => {
  await db('users').truncate();
})

afterAll(async () => {
  await db.destroy();
})

describe('HTTP tests', () => {
  test('API is running', async () => {
    let res = await request(server).get('/');
    expect(res).toBeDefined();
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ api: 'up' });
  })

  test('POST /register', async () => {
    let res = await request(server).post('/api/auth/register').send({
      username: 'john',
      password: 1234
    })
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(1);
    expect(res.body.username).toBe('john');
  })

  test('invalid POST /register', async () => {
    let res = await request(server).post('/api/auth/register').send({
      username: 'tom',
    })
    expect(res.statusCode).toBe(401);
    expect(res.body.id).not.toBeDefined();

    res = await request(server).post('/api/auth/register').send({
      username: '  ',
      password: 12
    })
    expect(res.body).toEqual({ message: "Invalid credentials" });
  })

  test('POST /login', async () => {
    await request(server).post('/api/auth/register').send({
      username: 'john',
      password: 1234
    })

    let res = await request(server).post('/api/auth/login').send({
      username: 'john',
      password: 1234
    })

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('welcome, john');
  })

  test('invalid POST /login', async () => {
    let res = await request(server).post('/api/auth/login').send({
      username: 'bob',
      password: 12345
    })

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("invalid credentials");

    await request(server).post('/api/auth/register').send({
      username: 'alice',
      password: 12345
    })

    res = await request(server).post('/api/auth/login').send({
      username: 'alice',
      password: 456
    })

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("invalid credentials");
  })

  test('proper response on missing token, GET /jokes', async () => {
    const res = await request(server).get('/api/jokes');

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe("token required");
  })

  test('proper response for unverified token, GET /jokes', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'fake');

    expect(res.statusCode).toBe(401)
    expect(res.body.message).toBe("token invalid");
  })
})