const { brevo } = require("./brevo");

const sendOtpEmail = async (email, otp) => {
  try {
    await brevo.transactionalEmails.sendTransacEmail({
      sender: { email: "ishika2784@gmail.com", name: "Megamind Creations" },
      to: [{ email }],
      templateId: 1,
      params: { otp }
    });
    console.log("OTP sent successfully via Brevo template");
  } catch (error) {
    console.error("Error sending OTP:", error?.message || error);
    throw error;
  }
};

module.exports = { sendOtpEmail };
