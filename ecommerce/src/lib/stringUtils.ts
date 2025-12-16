export const generateRandomReference = (prefix: string = "REF") => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
  const randomNum = () => nums[Math.floor(Math.random() * nums.length)];

  
  
  return `#${randomChar()}${randomChar()}${randomNum()}${randomNum()}${randomChar()}${randomChar()}`;
};
