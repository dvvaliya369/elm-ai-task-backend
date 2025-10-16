import swaggerJSDoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Post API',
      version: '1.0.0',
      description: 'API documentation for Post related endpoints',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000' 
          : 'https://your-api-domain.com',
        description: process.env.NODE_ENV === 'development' 
          ? 'Development server' 
          : 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Post: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Post ID',
            },
            title: {
              type: 'string',
              description: 'Post title',
            },
            content: {
              type: 'string',
              description: 'Post content',
            },
            author: {
              type: 'string',
              description: 'Author ID',
            },
            fileUrl: {
              type: 'string',
              description: 'URL of attached file',
            },
            likes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of user IDs who liked the post',
            },
            comments: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Comment',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Comment ID',
            },
            content: {
              type: 'string',
              description: 'Comment content',
            },
            author: {
              type: 'string',
              description: 'Comment author ID',
            },
            likes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of user IDs who liked the comment',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/post.route.ts'], // Only include post routes
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
