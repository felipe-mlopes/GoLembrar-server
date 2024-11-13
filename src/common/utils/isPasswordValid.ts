export function isPasswordValid(password: string): boolean {
  const regex = /^(?=.*[A-Z]).{6,25}$/;
  return regex.test(password);
}
