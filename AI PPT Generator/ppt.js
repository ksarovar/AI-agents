const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Allowed values for dropdowns
const ALLOWED_SLIDE_COUNTS = [4, 6, 8];
const ALLOWED_TONES = ['persuasive', 'professional', 'casual'];
const ALLOWED_AUDIENCES = ['general public', 'executives', 'students'];

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI PowerPoint Generator API',
      version: '1.2.0',
      description: 'Generate tailored PowerPoint presentations from user requirements',
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: ['./ppt.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// OpenRouter AI client setup
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: "openrouter api key",
});

// Input validation middleware
const validateRequest = (req, res, next) => {
  const { requirements, slideCount, tone, audience } = req.body;

  // Validate requirements (free-text)
  if (!requirements || typeof requirements !== 'string' || requirements.trim().length < 10) {
    return res.status(400).json({ error: 'Requirements must be a string with at least 10 characters' });
  }

  // Validate slideCount (dropdown)
  if (slideCount && !ALLOWED_SLIDE_COUNTS.includes(slideCount)) {
    return res.status(400).json({
      error: `Slide count must be one of: ${ALLOWED_SLIDE_COUNTS.join(', ')}`,
    });
  }

  // Validate tone (dropdown)
  if (tone && !ALLOWED_TONES.includes(tone)) {
    return res.status(400).json({
      error: `Tone must be one of: ${ALLOWED_TONES.join(', ')}`,
    });
  }

  // Validate audience (dropdown)
  if (audience && !ALLOWED_AUDIENCES.includes(audience)) {
    return res.status(400).json({
      error: `Audience must be one of: ${ALLOWED_AUDIENCES.join(', ')}`,
    });
  }

  next();
};

/**
 * @swagger
 * /preview-ppt:
 *   post:
 *     summary: Generate slide preview JSON from user requirements
 *     description: Creates a PowerPoint outline based on a free-text requirement and selected options for slide count, tone, and audience.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requirements
 *             properties:
 *               requirements:
 *                 type: string
 *                 minLength: 10
 *                 description: A detailed description of the presentation topic (free-text input).
 *                 example: Create a presentation about the benefits of solar energy
 *               slideCount:
 *                 type: integer
 *                 description: Number of slides to generate (select from dropdown).
 *                 enum: [4, 6, 8]
 *                 default: 6
 *               tone:
 *                 type: string
 *                 description: Tone of the presentation (select from dropdown).
 *                 enum: [persuasive, professional, casual]
 *                 default: persuasive
 *               audience:
 *                 type: string
 *                 description: Target audience for the presentation (select from dropdown).
 *                 enum: [general public, executives, students]
 *                 default: general public
 *     responses:
 *       200:
 *         description: Returns slide JSON preview
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slides:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       content:
 *                         type: array
 *                         items:
 *                           type: string
 *                       layout:
 *                         type: string
 *                       notes:
 *                         type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
app.post('/preview-ppt', validateRequest, async (req, res) => {
  const {
    requirements,
    slideCount = 6, // Default to your preferred value
    tone = 'persuasive', // Default to your preferred value
    audience = 'general public', // Default to your preferred value
  } = req.body;

  try {
    const model = 'qwen/qwen2.5-vl-3b-instruct:free';

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `
You are an expert presentation designer. Your task is to create a PowerPoint outline in JSON format based on user requirements.

Instructions:
- Generate exactly ${slideCount} slides.
- Each slide must include:
  - "title": A clear, engaging slide title.
  - "content": 3 to 6 concise bullet points (strings) tailored for the ${audience} audience.
  - "layout": Suggest a layout (e.g., "title", "content", "comparison", "image").
  - "notes": A brief speaker note (1-2 sentences).
- Use a ${tone} tone that is engaging and user-friendly.
- Ensure the presentation has a logical flow (e.g., intro, core content, conclusion).
- Adapt content to the audience: ${audience}.
- Output strict JSON with no markdown or wrappers.
          `,
        },
        {
          role: 'user',
          content: requirements,
        },
      ],
      extra_headers: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'PPT Generator',
      },
    });

    let content = completion.choices[0].message.content.trim();

    // Clean up AI response
    if (content.startsWith('```json') || content.startsWith('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    let slidesData;
    try {
      slidesData = JSON.parse(content);
    } catch (parseError) {
      console.error('Invalid JSON from AI:', content);
      return res.status(500).json({ error: 'Failed to parse slide data' });
    }

    // Validate slide data
    if (!Array.isArray(slidesData) || slidesData.length !== slideCount) {
      return res.status(500).json({ error: `Expected ${slideCount} slides` });
    }

    res.json({ slides: slidesData });
  } catch (error) {
    console.error('Error generating preview:', error.message);
    res.status(500).json({ error: 'Failed to generate slide preview' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api-docs`);
});