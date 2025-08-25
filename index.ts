import dotenv from 'dotenv';
dotenv.config(); 

import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

// --------------------
// Kontrollera miljövariabler
// --------------------
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'HITTADES' : 'INGET PASS');
console.log('CONTACT_EMAIL:', process.env.CONTACT_EMAIL);

// --------------------
// Skapa Express app
// --------------------
const app = express();

// Tillåt frontend på localhost:3000 (ändra till din frontend URL vid deployment)
app.use(cors({
  origin: 'http://localhost:3000',
}));

app.use(express.json());

// --------------------
// Nodemailer transporter
// --------------------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,               // smtp.gmail.com
  port: Number(process.env.SMTP_PORT),       // 587
  secure: false,                             // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  logger: true,
  debug: true,
});

// --------------------
// POST /api/contact
// --------------------
app.post('/api/contact', async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Alla fält måste fyllas i.' });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `Nytt meddelande från ${name}`,
      text: message,
      html: `<p>${message}</p><p>Från: ${name} (${email})</p>`,
    });

    console.log('Mail skickat:', info.response);
    res.status(200).json({ message: 'Mail skickat!' });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ message: 'Misslyckades att skicka mail.' });
  }
});

// --------------------
// Starta server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
