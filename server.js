const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer to handle the incoming PDF file in memory
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- EMAIL CONFIGURATION ---
// Configure your SMTP credentials here (e.g., Gmail App Password, Resend, or SendGrid)
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-app-password' 
    }
});

// API Endpoint to receive PDF and send email
app.post('/api/send-invoice', upload.single('invoice'), async (req, res) => {
    try {
        const { clientName, clientEmail, currency, totalAmount } = req.body;
        const pdfBuffer = req.file.buffer;

        if (!clientEmail || !pdfBuffer) {
            return res.status(400).json({ success: false, error: 'Missing client email or invoice file.' });
        }

        const mailOptions = {
            from: '"Desnix Studio" <your-email@gmail.com>',
            to: clientEmail,
            subject: `Invoice from Desnix Studio - ${currency} ${totalAmount}`,
            text: `Dear ${clientName},\n\nPlease find attached the premium invoice for the creative services rendered by Desnix Studio.\n\nThank you for your business.\n\nBest regards,\nDesnix Studio Management`,
            attachments: [
                {
                    filename: `Invoice_${clientName.replace(/\s+/g, '_')}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Invoice successfully sent to client.' });

    } catch (error) {
        console.error('Email Automation Error:', error);
        return res.status(500).json({ success: false, error: 'Failed to send email automation.' });
    }
});

app.listen(PORT, () => {
    console.log(`Desnix Studio Tool running smoothly on http://localhost:${PORT}`);
});
