// Top 100 most common passwords (simplified list)
export const TOP_100_PASSWORDS = new Set([
  "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111", "1234567", "dragon",
  "123123", "baseball", "abc123", "football", "monkey", "letmein", "696969", "shadow", "master", "666666",
  "qwertyuiop", "123321", "mustang", "1234567890", "michael", "password1", "sunshine", "admin", "welcome",
  "senior", "jordan", "superman", "iloveyou", "amanda", "ashley", "bailey", "passw0rd", "secret", "123qwe",
  "zxcvbn", "11111111", "1q2w3e4r", "pass", "123abc", "aaaaaa", "qazwsx", "trustno1", "hello", "charlie",
  "1qaz2wsx", "password123", "abcd1234", "112233", "passw0rd1", "test", "123456a", "abc123456", "qwerty123",
  "123456789a", "letmein1", "welcome1", "admin123", "password12", "qwerty1", "12345678910", "12345678911",
  "football1", "monkey1", "12345678912", "baseball1", "iloveyou1", "sunshine1", "master1", "hello1", "dragon1"
]);

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Пароль должен содержать минимум 8 символов");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Пароль должен содержать хотя бы одну строчную букву");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Пароль должен содержать хотя бы одну заглавную букву");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Пароль должен содержать хотя бы одну цифру");
  }
  if (TOP_100_PASSWORDS.has(password.toLowerCase())) {
    errors.push("Этот пароль слишком распространен, выберите другой");
  }

  return { valid: errors.length === 0, errors };
}