
# Movie Management System

## Project Overview

This Movie Management System is built using the **NestJS** framework with **Prisma** as the ORM and **MySQL** as the database.
The system provides functionality to manage movies, including adding, updating, viewing, and deleting movie records. It also includes user authentication and role management features, ensuring that only authorized users can perform certain actions.

The project includes comprehensive unit and end-to-end (E2E) tests to ensure code quality and robustness.

## Technologies Used

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **Prisma**: A next-generation ORM that helps in querying the database in a type-safe manner.
- **MySQL**: Relational database used for storing movie and user data.
- **TypeScript**: For type-safe JavaScript development.
- **Jest**: For unit and E2E testing.
- **Docker**: For containerized deployment and development.
- **ESLint & Prettier**: For code formatting and linting.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd movie
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Copy the `.env.example` file to `.env` and fill in the necessary environment variables:
   ```bash
   cp .env.example .env
   ```

   Example variables to configure:
    - `DATABASE_URL` (MySQL database connection string)
        - If you're using Docker in the project, you can use the following connection string:
          ```
          DATABASE_URL="mysql://root:password@127.0.0.1:3306/movie?sslmode=disable&charset=utf8mb4&serverVersion=8.3.0-1.el8"
          ```
    - `AUTH_SECRET` (for JWT authentication)

## Running the Project

### Using Docker (Recommended)

If you have Docker installed, you can run the project using the provided `docker-compose.yml` file:

1. Start the services:
   ```bash
   docker-compose up --build
   ```

2. The app will be running at `http://localhost:3000`.

### Running Locally

To run the project locally without Docker:

1. Ensure your MySQL instance is running and the database is properly configured (you can use the `docker-entrypoint-initdb.d` for initializing the database).

2. Run the Prisma migrations to create the database schema:
   ```bash
   npx prisma migrate dev
   ```

3. Seed the database with initial data:
   ```bash
   npx prisma db seed
   ```

4. Run the NestJS application:
   ```bash
   npm run start
   ```

5. The app will be available at `http://localhost:3000`.

## Running Tests

The project contains both unit tests and end-to-end tests. To run the tests, use the following commands:

### Unit Tests
```bash
npm run test
```

### E2E Tests
First create your .env.test file by copying the .env.example file and renaming it to .env.test

If you are using docker, you can use the following connection string:
```
DATABASE_URL="mysql://root:password@mysql:3306/movie_test?sslmode=disable&charset=utf8mb4&serverVersion=8.3.0-1.el8"
```
Then run the following command to run the E2E tests:
    
```bash
npm run test:e2e
```

The tests are written using **Jest** and provide full coverage for the application's core features.

## Environment Configuration

The `.env.example` file contains the environment variables used by the application. Before running the project, ensure that you create a `.env` file in the project root and provide the required values.

Example:
```env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/movie?sslmode=disable&charset=utf8mb4&serverVersion=8.3.0-1.el8"
AUTH_SECRET=your_jwt_secret
```

## API Documentation

The application uses the **Swagger** module to provide API documentation. Once the application is running, you can view the API docs by navigating to:

```
http://localhost:3000/api
```

## Folder Structure

The folder structure of the project is organized as follows:

```
movie-main/
│
├── src/                  # Application source code
│   ├── auth/             # Authentication module
│   ├── common/           # Commonly used files
│   ├── movie/            # Movies module
│   ├── permission/       # Permissions module
│   ├── prisma/           # Prisma ORM configuration
│   ├── role/             # Role module
│   ├── session/          # Session module
│   ├── ticket/           # Ticket module
│   ├── watch-history/    # Watch history module
│   └── main.ts           # Application entry point
│
├── prisma/               # Prisma migrations and schema
│   ├── schema.prisma     # Prisma schema file
│   └── migrations        # Database migration files
│   └── seeds             # Seeds for local development
│
├── test/                 # E2E test cases
│
├── docker-compose.yml    # Docker configuration
└── package.json          # Node.js dependencies and scripts
```

## Docker Setup

This project is Dockerized for easier development and deployment. The `docker-compose.yml` file sets up both the application and a MySQL database.

To build and run the containers:

```bash
docker-compose up --build
```

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Commit your changes (`git commit -am 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature-name`).
5. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
