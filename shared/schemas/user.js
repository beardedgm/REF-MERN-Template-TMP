const { z } = require('zod');

const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  plan: z.string(),
  createdAt: z.string(),
});

module.exports = { userResponseSchema };
