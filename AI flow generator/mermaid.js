const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const OpenAI = require('openai');
const cors = require('cors'); // Import the cors middleware
require('dotenv').config();
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors()); // Use the cors middleware

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mermaid Code Generator API',
      version: '1.0.0',
      description: 'API to generate Mermaid code from requirements using OpenRouter AI',
    },
    servers: [{ url: `http://localhost:${port}` }],
  },
  apis: ['./mermaid.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// OpenRouter API configuration using OpenAI client
const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: "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",
});

// Route to generate Mermaid code
/**
 * @swagger
 * /generate-mermaid:
 *   post:
 *     summary: Generate Mermaid code from requirements
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requirements:
 *                 type: string
 *                 description: The requirements to generate Mermaid code from
 *                 example: "Create a flowchart for a user login process"
 *             required:
 *               - requirements
 *     responses:
 *       200:
 *         description: Successfully generated Mermaid code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mermaidCode:
 *                   type: string
 *                   description: The generated Mermaid code
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Error generating Mermaid code
 */
app.post('/generate-mermaid', async (req, res) => {
  const { requirements } = req.body;

  if (!requirements) {
    return res.status(400).json({ error: 'Requirements are required' });
  }

  // Hardcoded model
  // const selectedModel = 'qwen/qwq-32b:free';
  const selectedModel = 'openrouter/quasar-alpha';


  try {
    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: `
            You are an expert in generating Mermaid code for diagrams such as flowcharts, sequence diagrams, and class diagrams. Your task is to interpret the user's requirements and produce valid, well-structured Mermaid syntax that accurately represents the described process, system, or relationship. Follow these guidelines:

            1. **Diagram Type Selection**: Choose the most appropriate Mermaid diagram type based on the requirements:
               - Use 'graph TD' (flowchart) for processes, workflows, or decision trees.
               - Use 'sequenceDiagram' for interactions between entities over time.
               - Use 'classDiagram' for object-oriented structures or relationships.
               - If the type is unclear, default to a flowchart ('graph TD') unless specified otherwise.

            2. **Syntax Rules**:
               - Ensure proper Mermaid syntax (e.g., 'A --> B' for flowcharts, 'Actor1 -> Actor2: Message' for sequence diagrams).
               - Use meaningful node names and labels that reflect the requirement details.
               - For flowcharts, include decision points with '{Condition}' and branches like '--> |Yes|'.
               - For sequence diagrams, use '->' for messages and '-->' for replies if applicable.

            3. **Clarity and Structure**:
               - Break complex requirements into logical steps or interactions.
               - Use indentation and line breaks for readability.
               - Avoid overly generic or vague node names (e.g., prefer 'ValidateCredentials' over 'Step1').

            4. **Output**:
               - Return only the Mermaid code, without explanations, comments, or additional text.
               - Ensure the code is ready to render in a Mermaid-compatible viewer.

            Example:
            Requirement: "Create a flowchart for a user login process"
            Output:
            graph TD
              A[Start] --> B[Enter Username]
              B --> C[Enter Password]
              C --> D{Valid Credentials?}
              D --> |Yes| E[Login Success]
              D --> |No| F[Login Failed]
              E --> G[End]
              F --> G
          `,
        },
        {
          role: 'user',
          content: requirements, // Simple text input, no image support needed for this use case
        },
      ],
      extra_headers: {
        'HTTP-Referer': 'http://localhost:3000', // Replace with your site URL
        'X-Title': 'Mermaid Generator', // Replace with your site name
      },
      extra_body: {}, // Empty as in your example, can be extended if needed
    });

    const mermaidCode = completion.choices[0].message.content;
    res.json({ mermaidCode });
  } catch (error) {
    console.error('Error generating Mermaid code:', error.message);
    res.status(500).json({ error: 'Failed to generate Mermaid code' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
