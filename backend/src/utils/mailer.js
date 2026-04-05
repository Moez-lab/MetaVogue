import nodemailer from 'nodemailer';

/**
 * Sends an email using nodemailer.
 * If EMAIL_USER and EMAIL_PASS are provided in .env, it uses Gmail SMTP.
 * Otherwise, it uses Ethereal Mail (a mock service for testing).
 */
export const sendEmail = async (options) => {
    let transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Production Transport (Gmail / Custom SMTP)
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    } else {
        // Development Transport (Mock Ethereal Mail)
        // Note: For real development, use a fixed Ethereal account, 
        // but for this demo, we can create one on the fly.
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log(`\n📧 MOCK EMAIL SERVICE INITIALIZED (Ethereal Mail)`);
    }

    const mailOptions = {
        from: `"MetaVogue Studio" <${process.env.EMAIL_USER || 'no-reply@metavogue.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    if (!process.env.EMAIL_USER && !process.env.EMAIL_PASS) {
        console.log('---------------------------------------------------------');
        console.log('✅ TEST EMAIL SENT SUCCESSFULLY!');
        console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log('---------------------------------------------------------');
        return { 
            messageId: info.messageId, 
            previewUrl: nodemailer.getTestMessageUrl(info) 
        };
    }

    return info;
};
