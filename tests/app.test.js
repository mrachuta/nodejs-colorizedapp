const request = require('supertest');

process.env.MESSAGE = 'Hello from tests!';
process.env.BG_COLOR = '#ffc0cb';
process.env.FONT_COLOR = '#ffffff';

const { app, server } = require('../src/app');

describe('App', () => {
  it('Should respond with HTTP 200 OK code on /live', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });

  it('Should respond with specific message /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Hello from tests!');
  });

  it('Should respond with specific background color /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('#ffc0cb');
  });

  it('Should respond with specific font color /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('#ffffff');
  });

  it('Should respond with specific JSON structure on /json', async () => {
    const response = await request(app).get('/json');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('bgColor');
    expect(response.body).toHaveProperty('fontColor');
    expect(response.body).toHaveProperty('message');
  });

});

afterAll((done) => {
  server.close(done);
});
