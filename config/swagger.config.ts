import { Options } from 'swagger-jsdoc';

const swaggerConfig: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gemini CLI API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Gemini CLI application.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.ts', './models/**/*.ts'], // Path to the API routes and models
};

export default swaggerConfig;