export const generateRandomReference = (prefix: string = "REF") => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
  const randomNum = () => nums[Math.floor(Math.random() * nums.length)];

  // Generate something like #BW99DK
  // 1 char # + 2 random chars + 2 numbers + 2 random chars
  return `#${randomChar()}${randomChar()}${randomNum()}${randomNum()}${randomChar()}${randomChar()}`;
};
