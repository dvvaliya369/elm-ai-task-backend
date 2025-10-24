import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import { Request, Response } from 'express';

// Basic swagger definition
const swaggerDefinition: Options['definition'] = {
  openapi: '3.0.0',
  info: {
    title: 'Elm AI Task Backend API',
    version: '1.0.0',
    description: 'Backend API for elm-ai-task application',
    contact: {
      name: 'dvvaliya369',
      email: 'dvvaliya369@gmail.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.API_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
    },
    schemas: {
      // Common response schemas
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          stack: {
            type: 'string',
            description: 'Stack trace (only in development)',
          },
        },
      },
      // Auth schemas
      SignUpRequest: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            minLength: 4,
            example: 'password123',
          },
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
        },
      },
      SignInRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            example: 'password123',
          },
        },
      },
      SignInResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  user: {
                    $ref: '#/components/schemas/User',
                  },
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  },
                },
              },
            },
          },
        ],
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: {
            type: 'string',
            example: 'oldPassword123',
          },
          newPassword: {
            type: 'string',
            minLength: 4,
            example: 'newPassword123',
          },
        },
      },
      // User schema
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          fullName: {
            type: 'string',
            example: 'John Doe',
          },
          profilePhoto: {
            type: 'string',
            example: 'https://example.com/photo.jpg',
          },
        },
      },
      // Post schemas
      Post: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          title: {
            type: 'string',
            example: 'Sample Post Title',
          },
          content: {
            type: 'string',
            example: 'This is the content of the post',
          },
          author: {
            $ref: '#/components/schemas/User',
          },
          likes: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
          },
          comments: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Comment',
            },
          },
          fileUrl: {
            type: 'string',
            example: 'https://example.com/file.jpg',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      CreatePostRequest: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: {
            type: 'string',
            example: 'Sample Post Title',
          },
          content: {
            type: 'string',
            example: 'This is the content of the post',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: 'Optional file upload',
          },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
          },
          text: {
            type: 'string',
            example: 'This is a comment',
          },
          user: {
            $ref: '#/components/schemas/User',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2023-01-01T00:00:00.000Z',
          },
        },
      },
      CommentRequest: {
        type: 'object',
        required: ['text'],
        properties: {
          text: {
            type: 'string',
            example: 'This is a comment',
          },
        },
      },
      // Profile schema
      UpdateProfileRequest: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            example: 'John',
          },
          lastName: {
            type: 'string',
            example: 'Doe',
          },
          bio: {
            type: 'string',
            example: 'Software developer',
          },
          file: {
            type: 'string',
            format: 'binary',
            description: 'Profile photo',
          },
        },
      },
    },
  },
};

const options: Options = {
  definition: swaggerDefinition,
  apis: [
    './routes/*.ts',
    './controllers/*.ts',
    './dist/routes/*.js',
    './dist/controllers/*.js',
  ],
};

const specs = swaggerJSDoc(options);

export default specs;

// Swagger docs endpoint handler
export const swaggerDocsHandler = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
};
