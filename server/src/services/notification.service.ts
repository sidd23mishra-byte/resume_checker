import nodemailer from "nodemailer";

export class NotificationService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: `"AI Resume Analyzer" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
  }

  async notifyResumeCompleted(userEmail: string, resumeName: string) {
    const subject = "Your Resume Analysis is Ready!";
    const text = `Hi! Your resume "${resumeName}" has been analyzed. Check your dashboard for details.`;
    await this.sendEmail(userEmail, subject, text);
  }

  async notifyLowCredits(userEmail: string, creditsLeft: number) {
    const subject = "Credits Low!";
    const text = `You have only ${creditsLeft} credits left. Upgrade your plan to continue using AI services.`;
    await this.sendEmail(userEmail, subject, text);
  }
}