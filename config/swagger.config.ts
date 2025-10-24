import swaggerJsdoc from "swagger-jsdoc";
import envConfig from "./env.config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API",
      version: "1.0.0",
      description:
        "A comprehensive social media API with user authentication, posts, comments, likes, and profile management. Built with Express, TypeScript, MongoDB, and Redis caching.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${envConfig.PORT}`,
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Posts",
        description: "Post creation, management, and social interactions",
      },
      {
        name: "Profiles",
        description: "User profile management and retrieval",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
              example: "64f8a3b2c9d8e1234567890a",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            firstName: {
              type: "string",
              description: "User first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User last name",
              example: "Doe",
            },
            profilePhoto: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "Profile photo URL",
                  example: "https://storage.googleapis.com/bucket/profile.jpg",
                },
                size: {
                  type: "number",
                  description: "File size in bytes",
                  example: 102400,
                },
                mediaType: {
                  type: "string",
                  description: "MIME type",
                  example: "image/jpeg",
                },
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Post ID",
              example: "64f8a3b2c9d8e1234567890b",
            },
            user: {
              type: "string",
              description: "User ID who created the post",
              example: "64f8a3b2c9d8e1234567890a",
            },
            caption: {
              type: "string",
              description: "Post caption text",
              example: "Beautiful sunset at the beach!",
            },
            media: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "Media file URL",
                  example: "https://storage.googleapis.com/bucket/post.jpg",
                },
                type: {
                  type: "string",
                  enum: ["image", "video"],
                  description: "Media type",
                  example: "image",
                },
                size: {
                  type: "number",
                  description: "File size in bytes",
                  example: 204800,
                },
                mediaType: {
                  type: "string",
                  description: "MIME type",
                  example: "image/jpeg",
                },
              },
            },
            likes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user: {
                    type: "string",
                    description: "User ID who liked",
                    example: "64f8a3b2c9d8e1234567890c",
                  },
                  name: {
                    type: "string",
                    description: "Full name of user who liked",
                    example: "Jane Smith",
                  },
                },
              },
            },
            comments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  _id: {
                    type: "string",
                    description: "Comment ID",
                    example: "64f8a3b2c9d8e1234567890d",
                  },
                  user: {
                    type: "string",
                    description: "User ID who commented",
                    example: "64f8a3b2c9d8e1234567890c",
                  },
                  name: {
                    type: "string",
                    description: "Full name of commenter",
                    example: "Jane Smith",
                  },
                  text: {
                    type: "string",
                    description: "Comment text",
                    example: "Amazing photo!",
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                    description: "Comment timestamp",
                  },
                },
              },
            },
            isDeleted: {
              type: "boolean",
              description: "Soft delete flag",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Post creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Last update timestamp",
            },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
              description: "JWT access token (expires in 15 minutes)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            refreshToken: {
              type: "string",
              description: "JWT refresh token (expires in 7 days)",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Error message",
              example: "An error occurred",
            },
            statusCode: {
              type: "integer",
              description: "HTTP status code",
              example: 400,
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              description: "Validation error message",
              example: "Validation failed",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "email",
                  },
                  message: {
                    type: "string",
                    example: "Invalid email format",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Unauthorized access",
                statusCode: 401,
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Resource not found",
                statusCode: 404,
              },
            },
          },
        },
        ValidationError: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError",
              },
            },
          },
        },
        ServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                success: false,
                message: "Internal server error",
                statusCode: 500,
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.ts"], // Path to route files with Swagger annotations
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
