export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3 && username.length <= 30;
};

export const validateCaption = (caption) => {
  return caption.length <= 2200;
};

export const validateDomain = (domain) => {
  return domain.length <= 100;
};

export const validateTags = (tags) => {
  if (!tags) return true;
  const tagsArray = tags.split(',').map(t => t.trim());
  return tagsArray.every(tag => tag.length > 0 && tag.length <= 30);
};