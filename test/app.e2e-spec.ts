import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '@/app.module';
import { CreateMovieDto } from '@movie/dto/create-movie.dto';
import { UpdateMovieDto } from '@movie/dto/update-movie.dto';
import { CreateSessionDto } from '@session/dto/create-session.dto';
import { UpdateSessionDto } from '@session/dto/update-session.dto';
import { PREDEFINED_ROLES } from '@auth/models/auth.model';
import { RegisterDto } from '@auth/dto/register.dto';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client'; // Add this import for Prisma

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });
const prisma = new PrismaClient(); // Instantiate PrismaClient

describe('Movie Management System (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let customerToken: string;
  let customerRoleId: string;
  let movieId1: number;
  let movieId2: number;
  let sessionId1: number;
  let sessionId2: number;

  // Cleanup function to truncate all tables
  const cleanDatabase = async () => {
    console.log('Cleaning up database...');
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`; // Disable foreign key checks
    await prisma.$executeRaw`TRUNCATE TABLE Movie;`;
    await prisma.$executeRaw`TRUNCATE TABLE User;`;
    await prisma.$executeRaw`TRUNCATE TABLE Ticket;`;
    await prisma.$executeRaw`TRUNCATE TABLE Session;`;
    await prisma.$executeRaw`TRUNCATE TABLE WatchHistory;`;
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`; // Re-enable foreign key checks
  };

  beforeAll(async () => {
    execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
      env: {
        ...process.env, // Spread the current process environment
        DATABASE_URL: process.env.DATABASE_URL, // Explicitly set DATABASE_URL for Prisma
      },
    });

    // Clean up the database before running tests
    await cleanDatabase();

    execSync('npx prisma db seed --schema=prisma/schema.prisma', {
      env: {
        ...process.env, // Spread the current process environment
        DATABASE_URL: process.env.DATABASE_URL, // Explicitly set DATABASE_URL for Prisma
      },
    });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Admin login
  it('Login as admin', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'securepassword' });
    expect(response.status).toBe(HttpStatus.OK);
    adminToken = response.body.token;
  });

  // List roles
  it('List roles', async () => {
    const response = await request(app.getHttpServer())
      .get('/roles')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    customerRoleId = response.body.data.find(
      role => role.name === PREDEFINED_ROLES.CUSTOMER,
    ).id;
  });

  // Create a movie
  it('Create a movie as admin', async () => {
    const createMovieDto: CreateMovieDto = {
      name: 'Test Movie',
      ageRestriction: 18,
    };
    const response = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createMovieDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    movieId1 = response.body.id;
  });

  // List all movies
  it('List all movies as admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // Update a movie
  it('Update a movie as admin', async () => {
    const updateMovieDto: UpdateMovieDto = {
      name: 'Updated Movie Title',
    };
    const response = await request(app.getHttpServer())
      .patch(`/movies/${movieId1}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateMovieDto);
    expect(response.status).toBe(HttpStatus.OK);
  });

  // Delete a movie
  it('Delete a movie as admin', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/movies/${movieId1}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.NO_CONTENT);
  });

  // Bulk create two movies
  it('Create two movies in bulk as admin', async () => {
    const createMovieDto: CreateMovieDto[] = [
      { name: 'Movie 1', ageRestriction: 18 },
      { name: 'Movie 2', ageRestriction: 18 },
    ];
    const response = await request(app.getHttpServer())
      .post('/movies/bulk')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createMovieDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    movieId1 = response.body[0].id;
    movieId2 = response.body[1].id;
  });

  // Create sessions for movies
  it('Create two sessions for the movies as admin', async () => {
    const createSessionDto1: CreateSessionDto = {
      date: new Date('2024-10-10'),
      timeSlot: '10:00-12:00',
      roomNumber: 1,
    };
    const createSessionDto2: CreateSessionDto = {
      date: new Date('2024-10-11'),
      timeSlot: '12:00-14:00',
      roomNumber: 2,
    };
    let response = await request(app.getHttpServer())
      .post(`/movies/${movieId1}/sessions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createSessionDto1);
    expect(response.status).toBe(HttpStatus.CREATED);
    sessionId1 = response.body.id;

    response = await request(app.getHttpServer())
      .post(`/movies/${movieId2}/sessions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(createSessionDto2);
    expect(response.status).toBe(HttpStatus.CREATED);
    sessionId2 = response.body.id;
  });

  // List all sessions
  it('List all sessions as admin', async () => {
    const response = await request(app.getHttpServer())
      .get(`/movies/${movieId1}/sessions`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // Update one session
  it('Update a session as admin', async () => {
    const updateSessionDto: UpdateSessionDto = {
      timeSlot: '16:00-18:00',
    };
    const response = await request(app.getHttpServer())
      .patch(`/movies/${movieId1}/sessions/${sessionId1}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateSessionDto);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.timeSlot).toBe('16:00-18:00');
  });

  // Delete one session
  it('Delete a session as admin', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/movies/${movieId1}/sessions/${sessionId1}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(HttpStatus.NO_CONTENT);
  });

  // Customer login
  it('Register as customer', async () => {
    const registerDto: RegisterDto = {
      username: 'customer 1',
      password: 'customerpassword',
      age: 25,
      roleId: customerRoleId,
    };
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    customerToken = response.body.token;
  });

  // List movies as customer
  it('List all movies as customer', async () => {
    const response = await request(app.getHttpServer())
      .get('/movies')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  // Buy tickets for two movies
  it('Buy a ticket for a movies as customer', async () => {
    const response = await request(app.getHttpServer())
      .post(`/movies/${movieId2}/sessions/${sessionId2}/tickets`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  // Watch both movies as customer
  it('Watch a movie as customer', async () => {
    const response = await request(app.getHttpServer())
      .post(`/movies/${movieId2}/sessions/${sessionId2}/watch`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(response.status).toBe(HttpStatus.CREATED);
  });

  // List watch history
  it('List watch history as customer', async () => {
    const response = await request(app.getHttpServer())
      .get(`/watch-history`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
