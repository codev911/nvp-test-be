import type { Express } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PORT } from './env.config';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Employee Management System API',
    version: '1.0.0',
    description:
      'Dokumentasi REST API untuk Employee Management System. Semua response mengikuti envelope dengan field `message`, `data`, dan opsional `pagination`.',
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: 'Local development server',
    },
    {
      url: `ws://localhost:${PORT}`,
      description: 'WebSocket base (gunakan path /ws/notifications)',
    },
  ],
  tags: [
    { name: 'Health', description: 'Endpoint monitoring aplikasi' },
    { name: 'Auth', description: 'Autentikasi admin & profil' },
    { name: 'Employees', description: 'Manajemen data karyawan (batch & CSV)' },
    { name: 'Notifications', description: 'Notifikasi sistem & websocket' },
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
      ResponseEnvelope: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'error'] },
          message: { type: 'string' },
          data: {},
          pagination: { $ref: '#/components/schemas/Pagination' },
        },
        required: ['message'],
      },
      Pagination: {
        type: 'object',
        properties: {
          total_data: { type: 'integer', example: 120 },
          total_page: { type: 'integer', example: 12 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
        },
      },
      ErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ResponseEnvelope' },
          {
            type: 'object',
            properties: {
              message: { type: 'string', example: 'Invalid request body' },
              code: { type: 'integer', example: 400 },
            },
          },
        ],
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          password: { type: 'string', minLength: 8, example: 'admin12345' },
        },
        required: ['email', 'password'],
      },
      AuthToken: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      AuthenticatedUser: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'admin' },
          role: { type: 'string', example: 'admin' },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6650155f946f9b0f4d993e1a' },
          name: { type: 'string', example: 'Jane Doe' },
          position: { type: 'string', example: 'Software Engineer' },
          age: { type: 'integer', example: 28 },
          salary: { type: 'number', format: 'float', example: 12000000 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      EmployeeCreateItem: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John Wick' },
          position: { type: 'string', example: 'Operations Manager' },
          age: { type: 'integer', example: 35 },
          salary: { type: 'number', format: 'float', example: 18000000 },
        },
        required: ['name', 'position', 'age', 'salary'],
      },
      EmployeeUpdateItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '6650155f946f9b0f4d993e1a' },
          name: { type: 'string', example: 'Jane Doe' },
          position: { type: 'string', example: 'Senior Software Engineer' },
          age: { type: 'integer', example: 29 },
          salary: { type: 'number', format: 'float', example: 14000000 },
        },
        required: ['id'],
      },
      DeleteEmployeesRequest: {
        type: 'array',
        items: { type: 'string', example: '6650155f946f9b0f4d993e1a' },
      },
      QueueCountResponse: {
        allOf: [
          { $ref: '#/components/schemas/ResponseEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  total_queued: { type: 'integer', example: 20 },
                },
              },
            },
          },
        ],
      },
      EmployeeListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ResponseEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: '#/components/schemas/Employee' },
              },
              pagination: { $ref: '#/components/schemas/Pagination' },
            },
          },
        ],
      },
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'notif-01' },
          title: { type: 'string', example: 'CSV import' },
          message: { type: 'string', example: 'Import CSV 150 baris sedang diproses.' },
          created_at: { type: 'string', format: 'date-time' },
          read: { type: 'boolean', example: false },
        },
      },
      NotificationsListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ResponseEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: { $ref: '#/components/schemas/Notification' },
              },
            },
          },
        ],
      },
      NotificationsReadResponse: {
        allOf: [
          { $ref: '#/components/schemas/ResponseEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  modified: { type: 'integer', example: 2 },
                },
              },
            },
          },
        ],
      },
      WebsocketConnected: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'connected' },
        },
      },
      WebsocketNotificationPayload: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'notification' },
          data: { $ref: '#/components/schemas/Notification' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Mengembalikan status aplikasi dan timestamp server.',
        responses: {
          200: {
            description: 'Aplikasi sehat.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ResponseEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            status: { type: 'string', example: 'healthy' },
                            timestamp: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login admin',
        description: 'Validasi kredensial admin dan menghasilkan JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Autentikasi sukses.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ResponseEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/AuthToken' },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Validasi gagal',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Password salah',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          404: {
            description: 'User tidak ditemukan',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Profil user saat ini',
        description: 'Mengambil username & role dari token Bearer.',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'Berhasil mendapatkan profil.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ResponseEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/AuthenticatedUser' },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: {
            description: 'Token invalid atau kosong',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/employee/data': {
      get: {
        tags: ['Employees'],
        summary: 'List data karyawan dengan pagination & sorting',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1 },
            description: 'Halaman (default 1)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100 },
            description: 'Jumlah data per halaman (default 10)',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['name', 'age', 'position', 'salary'] },
            description: 'Kolom sortir',
          },
          {
            name: 'sorttype',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] },
            description: 'Arah sortir',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Pencarian nama/posisi',
          },
        ],
        responses: {
          200: {
            description: 'Data karyawan berhasil diambil.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/ResponseEnvelope' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/Employee' },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            limit: { type: 'integer', example: 10 },
                            page: { type: 'integer', example: 1 },
                            total_page: { type: 'integer', example: 8 },
                            total_data: { type: 'integer', example: 75 },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: {
            description: 'Query tidak valid',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/employee/add/csv': {
      post: {
        tags: ['Employees'],
        summary: 'Impor karyawan via CSV (streaming)',
        description:
          'Upload file CSV dengan header name,position,salary,age untuk di-queue secara batch.',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
                required: ['file'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Baris CSV dimasukkan ke antrean.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/QueueCountResponse' } },
            },
          },
          500: {
            description: 'Gagal parsing/upload',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/employee/add': {
      post: {
        tags: ['Employees'],
        summary: 'Tambah karyawan batch (JSON)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/EmployeeCreateItem' },
                minItems: 1,
              },
              example: [
                { name: 'John Wick', position: 'Operations Manager', age: 35, salary: 18000000 },
                { name: 'Jane Doe', position: 'QA Lead', age: 31, salary: 15000000 },
              ],
            },
          },
        },
        responses: {
          200: {
            description: 'Data dimasukkan ke antrean.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/QueueCountResponse' } },
            },
          },
          400: {
            description: 'Payload tidak valid',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/employee/update': {
      patch: {
        tags: ['Employees'],
        summary: 'Update karyawan batch',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/EmployeeUpdateItem' },
                minItems: 1,
              },
              example: [
                { id: '6650155f946f9b0f4d993e1a', salary: 20000000 },
                { id: '6650155f946f9b0f4d993e1b', position: 'Senior QA Lead' },
              ],
            },
          },
        },
        responses: {
          200: {
            description: 'Update dimasukkan ke antrean.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/QueueCountResponse' } },
            },
          },
          400: {
            description: 'Payload tidak valid',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/employee/remove': {
      delete: {
        tags: ['Employees'],
        summary: 'Hapus karyawan batch',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeleteEmployeesRequest' },
              example: ['6650155f946f9b0f4d993e1a', '6650155f946f9b0f4d993e1b'],
            },
          },
        },
        responses: {
          200: {
            description: 'Penghapusan dimasukkan ke antrean.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/QueueCountResponse' } },
            },
          },
          400: {
            description: 'Payload tidak valid',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'List notifikasi terbaru',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Jumlah notifikasi (default 50, max sesuai service)',
            schema: { type: 'integer', example: 50 },
          },
        ],
        responses: {
          200: {
            description: 'Berhasil mengambil notifikasi.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationsListResponse' },
              },
            },
          },
        },
      },
    },
    '/notifications/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Tandai notifikasi sebagai dibaca',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { type: 'string', example: 'notif-01' },
              },
              example: ['notif-01', 'notif-02'],
            },
          },
        },
        responses: {
          200: {
            description: 'Jumlah notifikasi yang berubah status.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/NotificationsReadResponse' },
              },
            },
          },
        },
      },
    },
    '/ws/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'WebSocket notifikasi real-time',
        description:
          'Inisiasi koneksi WebSocket. Sertakan query `token` (JWT Bearer) pada URL. Server mengirimkan pesan `connected` lalu setiap notifikasi baru dikirim dengan tipe `notification`.',
        parameters: [
          {
            name: 'token',
            in: 'query',
            description: 'JWT untuk autentikasi websocket (sama dengan header Authorization)',
            required: true,
            schema: { type: 'string' },
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        ],
        responses: {
          101: {
            description: 'Upgrade ke WebSocket berhasil.',
            content: {
              'application/json': {
                examples: {
                  connected: { value: { type: 'connected' } },
                  notification: {
                    value: {
                      type: 'notification',
                      data: {
                        id: 'notif-01',
                        title: 'Employee queued',
                        message: 'Menambahkan 10 data karyawan ke antrean.',
                        created_at: '2024-05-01T10:00:00.000Z',
                        read: false,
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Token tidak diberikan',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          401: {
            description: 'Token invalid',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [],
});

export function setupSwagger(app: Express) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
