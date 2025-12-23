import nodemailer from "nodemailer";


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});


export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("Email server is ready");
    return true;
  } catch (error) {
    console.error("Email server error:", error);
    return false;
  }
};
