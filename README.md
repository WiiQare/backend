# WiiQare backend

[![codecov](https://codecov.io/github/WiiQare/backend/branch/main/graph/badge.svg?token=VJTCQPYQBP)](https://codecov.io/github/WiiQare/backend)


# Project Development Documentation
## Introduction
This documentation provides a comprehensive guide for WiiQare Backend developing a project using NestJS, TypeScript, and PostgreSQL. It covers the setup process, project structure, database integration, and common development tasks.

## Prerequisites
Before proceeding with the project development, ensure that you have the following prerequisites installed on your machine:
- Node.js (version 12 or higher)
- npm (Node Package Manager)
- PostgreSQL (with a database instance created)

## Project Setup
Follow the steps below to set up a new NestJS project:

1. Install NestJS CLI globally by running the following command:
   ```
   npm install -g @nestjs/cli
   ```

2. Create a new NestJS project by executing the following command:
   ```
   nest new project-name
   ```
   This will create a new directory with the specified project name.

3. Change into the project directory:
   ```
   cd project-name
   ```

4. Install project dependencies:
   ```
   npm install
   ```

## Project Structure
The project structure for a NestJS application typically follows the modular architecture pattern. By default, the project structure created by the NestJS CLI consists of the following directories and files:

- `src`: Contains the application source code.
  - `main.ts`: The entry point of the application.
  - `app.module.ts`: The root module that ties together all the modules in the application.
  - `app.controller.ts`: An example controller class for demonstrating API endpoints.
  - `app.service.ts`: An example service class for handling business logic.
- `test`: Contains test files.
- `node_modules`: Contains project dependencies.
- `package.json`: Defines the project's metadata and dependencies.

You can create additional modules, controllers, and services in the `src` directory as needed for your project.

## Database Integration
To integrate PostgreSQL into your NestJS project, you'll need to install the necessary packages and configure the database connection. Follow the steps below:

1. Install the required packages:
   ```
   npm install --save @nestjs/typeorm typeorm pg
   ```

2. Create a new `ormconfig.json` file in the project root directory with the following content:
   ```json
   {
     "type": "postgres",
     "host": "localhost",
     "port": 5432,
     "username": "your-username",
     "password": "your-password",
     "database": "your-database",
     "synchronize": true,
     "logging": true,
     "entities": ["dist/**/*.entity{.ts,.js}"],
     "migrations": ["dist/migrations/*{.ts,.js}"],
     "cli": {
       "migrationsDir": "src/migrations"
     }
   }
   ```
   Replace `"your-username"`, `"your-password"`, and `"your-database"` with your actual PostgreSQL credentials.

3. Create a new directory named `migrations` inside the `src` directory.

4. Create an empty `index.ts` file inside the `migrations` directory.

5. Add the `TypeOrmModule` import and configuration to the `app.module.ts` file:
   ```typescript
   import { Module } from '@nestjs/common';
   import { TypeOrmModule } from '@nestjs/typeorm';
   import { AppController } from './app.controller';
   import { AppService } from './app.service';

   @Module({
     imports: [
       TypeOrmModule.forRoot(),
     ],
     controllers: [AppController],
     providers: [AppService],
   })
   export class AppModule {}
   ```

   Ensure that the `TypeOrmModule.forRoot()` method is properly configured to load the `ormconfig.json` file.

