import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

const app = express();
app.set('view engine', 'ejs');

// app.use(express.urlencoded({ extended: false }));
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
// }));

















const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));