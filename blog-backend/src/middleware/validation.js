import { body, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  };
};

export const loginValidation = [
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
];

export const postValidation = [
  body('caption')
    .optional()
    .isString()
    .isLength({ max: 2200 })
    .withMessage('Caption must be less than 2200 characters'),
  body('domain')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Domain must be less than 100 characters'),
  body('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a comma-separated string'),
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

export const commentValidation = [
  body('content')
    .isString()
    .notEmpty()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];