const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: [
        "Welcome to StudyHive!",
        "We're excited to have you on board."
      ],
      action: {
        instructions:
          "To activate your account, please verify your email by clicking the button below:",
        button: {
          color: "#22BC66",
          text: "Verify Email",
          link: verificationUrl,
        },
      },
      outro: [
        "This verification link will expire soon for security reasons.",
        "If you did not create an account, you can safely ignore this email."
      ],
    },
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: [
        "We received a request to reset your password."
      ],
      action: {
        instructions:
          "Click the button below to set a new password:",
        button: {
          color: "#FF6136",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro: [
        "If you did not request a password reset, no further action is required.",
        "For security, this reset link will expire shortly."
      ],
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
};