# TODO App with NestJS, Prisma, and MySQL

This project is a simple TODO application built with **NestJS**, **Prisma**, and **MySQL**. It includes basic authentication and a TODO management system.

## Getting Started

### Prerequisites

Ensure you have the following tools installed:

- **Node.js** (v16 or higher)
- **MySQL** (local instance or Docker)
- **npm**
- **Git**

### Installation

1. Clone the repository:

```bash
git clone -b candidate-improvements https://github.com/vontanne/Interview-ToDo-App.git
```

2. Install dependencies:

```bash
npm install
```

3. **Set up the `.env` file**:

Please check the `.env.example` file in the project. It contains all the environment variables you need.

- Create a new `.env` file in the root folder.
- Copy all the variables from `.env.example` into the `.env` file.
- Then, add the correct values for each variable.

For example:

```bash
DATABASE_URL="mysql://root:password@localhost:3306/todoapp"
```

4. Apply Prisma migrations:

```bash
npx prisma migrate dev
```

5. Testing Instructions

To test the application, follow these steps:

_Unit Tests_

Run the following command to execute the unit tests:

```bash
npm run test
```

_End-to-End (e2e) Tests_

Before running e2e tests, you need to configure the `.env.test` file:

- Open the `.env.test` file.
- Set the `DATABASE_URL` variable to point to the test database.
  - Use a separate instance of Docker MySQL for testing.
  - Or, if you are using a local MySQL setup, configure it to use a separate test database.

After updating the `.env.test` file, run the e2e tests with this command:

```bash
npm run test:e2e
```

6. Start the application:

```bash
npm run start
```
