document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const formFeedback = document.getElementById("form-feedback");
  const passwordToggle = document.getElementById("password-toggle");

  const simulatedEmail = "admin@system.com";
  const simulatedPassword = "password";

  function setFieldError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.toggle("input-error", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function clearFormFeedback() {
    formFeedback.textContent = "";
  }

  function validateEmail() {
    const email = emailInput.value.trim();

    if (!email) {
      setFieldError(emailInput, emailError, "El correo electrónico es obligatorio.");
      return false;
    }

    if (!emailInput.validity.valid) {
      setFieldError(emailInput, emailError, "Ingresa un correo electrónico válido.");
      return false;
    }

    setFieldError(emailInput, emailError, "");
    return true;
  }

  function validatePassword() {
    const password = passwordInput.value;

    if (!password) {
      setFieldError(passwordInput, passwordError, "La contraseña es obligatoria.");
      return false;
    }

    if (password.length < 8) {
      setFieldError(passwordInput, passwordError, "La contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    setFieldError(passwordInput, passwordError, "");
    return true;
  }

  emailInput.addEventListener("input", function () {
    clearFormFeedback();
    if (emailInput.classList.contains("input-error")) {
      validateEmail();
    }
  });

  passwordInput.addEventListener("input", function () {
    clearFormFeedback();
    if (passwordInput.classList.contains("input-error")) {
      validatePassword();
    }
  });

  passwordToggle.addEventListener("click", function () {
    const showingPassword = passwordInput.type === "text";
    passwordInput.type = showingPassword ? "password" : "text";
    passwordToggle.textContent = showingPassword ? "Mostrar" : "Ocultar";
    passwordToggle.setAttribute("aria-label", showingPassword ? "Mostrar contraseña" : "Ocultar contraseña");
    passwordToggle.setAttribute("aria-pressed", String(!showingPassword));
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFormFeedback();

    const emailIsValid = validateEmail();
    const passwordIsValid = validatePassword();

    if (!emailIsValid || !passwordIsValid) {
      const firstInvalidField = !emailIsValid ? emailInput : passwordInput;
      firstInvalidField.focus();
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (email !== simulatedEmail || password !== simulatedPassword) {
      formFeedback.textContent = "Correo electrónico o contraseña incorrectos.";
      return;
    }

    window.location.href = "dashboard.html";
  });
});
