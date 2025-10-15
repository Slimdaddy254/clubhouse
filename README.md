# Clubhouse Clone

A simple web application for creating and sharing messages within a private club.

## Features

- User sign-up and login
- Message creation
- Display of messages on the home page
- Membership status with passcode
- Admin user role for message deletion

## Technologies Used

- Node.js
- Express
- EJS
- PostgreSQL
- bcrypt
- passport.js

## Setup

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Set up PostgreSQL database and update connection details in `.env`.
4.  Set the `SESSION_SECRET` in `.env`.
5.  Run the application: `npm start`

## Usage

- Sign up for an account.
- Log in to create and view messages.
- Join the club by entering the correct passcode on the `/join` page.
- Admin users can delete messages.