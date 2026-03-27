import emailjs from '@emailjs/browser';

export async function sendPasswordResetEmail(params: {
  toEmail: string;
  otp: string;
  resetLink: string;
}): Promise<void> {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId?.trim() || !templateId?.trim() || !publicKey?.trim()) {
    throw new Error(
      'Email is not configured. Set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in .env'
    );
  }

  await emailjs.send(
    serviceId,
    templateId,
    {
      user_email: params.toEmail,
      to_email: params.toEmail,
      email: params.toEmail,
      otp: params.otp,
      reset_link: params.resetLink,
      message:
        'Your password reset code will expire in 10 minutes. Use the link below to open the reset page.',
    },
    publicKey
  );
}
