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

Follow the steps below to set up the backend project:

1. Install NestJS CLI globally by running the following command:

   ```
   npm install -g @nestjs/cli
   ```

2. Clone and change into the project directory:

   ```
   git clone git@github.com:WiiQare/backend.git
   cd backend
   ```

3. Install project dependencies:
   ```
   yarn
   ```

## Project Structure

The project structure for the backend follows the modular architecture pattern of NestJS.

- `src`: Contains the application source code.
  - `main.ts`: The entry point of the application.
  - `app.module.ts`: The root module that ties together all the modules in the application.
- `package.json`: Defines the project's metadata and dependencies.
