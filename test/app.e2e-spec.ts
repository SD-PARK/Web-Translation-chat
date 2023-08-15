import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll((done) => {
    app.close();
    done();
  })

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/chat', () => {
    let postRoomID: number;

    describe('/room', () => {
      it('GET 200 OK', () => {
        return request(app.getHttpServer())
          .get('/chat/room')
          .expect(200)
      });

      it('POST 201 Created', async () => {
        const response = await request(app.getHttpServer())
          .post('/chat/room')
          .send({
            room_name: 'e2e test',
          })
          .expect(201)
        
        postRoomID = response.body.room_id;
      });

      it('POST 400 Bad Request', () => {
        return request(app.getHttpServer())
          .post('/chat/room')
          .send({
            bad_name: 'e2e BR test',
          })
          .expect(400)
      });
    });

    describe('/room/:name', () => {
      it('GET 200 OK', () => {
        return request(app.getHttpServer())
          .get('/chat/room/test')
          .expect(200)
      });
    });

    describe('/message', () => {
      it('GET 200 OK', () => {
        return request(app.getHttpServer())
          .get('/chat/message/?room_id=1')
          .expect(200)
      });

      it('GET 400 Bad Request', () => {
        return request(app.getHttpServer())
          .get('/chat/message/?roomid=BR')
          .expect(400)
      });

      it('GET 404 Not Found', () => {
        return request(app.getHttpServer())
          .get('/chat/message/?room_id=0')
          .expect(404)
      });

      it('POST 201 Created', () => {
        return request(app.getHttpServer())
          .post('/chat/message')
          .send({
            room_id: postRoomID,
            user_name: 'e2e',
            language: 'en',
            message_text: 'e2e test',
          })
          .expect(201)
      });

      it('POST 400 Bad Request', () => {
        return request(app.getHttpServer())
          .post('/chat/message')
          .send({
            id: postRoomID,
            name: 'e2e',
            lang: 'en',
            text: 'e2e BR test',
          })
          .expect(400)
      });

      it('POST 404 Not Found', () => {
        return request(app.getHttpServer())
          .post('/chat/message')
          .send({
            room_id: 0,
            user_name: 'e2e',
            language: 'en',
            message_text: 'e2e test',
          })
          .expect(404)
      });
    });

    describe('/room/:id', () => {
      it('PATCH 200 OK', () => {
        return request(app.getHttpServer())
          .patch('/chat/room/1')
          .send({
            room_name: '시험방',
          })
          .expect(200)
      });

      it('PATCH 400 Bad Request', () => {
        return request(app.getHttpServer())
          .patch('/chat/room/1')
          .send({
            bad_name: '시험방',
          })
          .expect(400)
      });

      it('PATCH 404 Not Found', () => {
        return request(app.getHttpServer())
          .patch('/chat/room/0')
          .send({
            room_name: '시험방',
          })
          .expect(404)
      });

      it('DELETE 200 OK', () => {
        // 왠지 모르겠는데 204 No Content가 안 됨;;
        return request(app.getHttpServer())
          .delete('/chat/room/' + postRoomID)
          .expect(200)
      });

      it('DELETE 404 Not Found', () => {
        return request(app.getHttpServer())
          .delete('/chat/room/0')
          .expect(404)
      });
    });
  });
});
