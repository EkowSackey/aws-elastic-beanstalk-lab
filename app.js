const express = require('express');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const app = express();

const PORT = process.env.PORT || 8080;
const APP_VERSION = process.env.APP_VERSION || 'v1';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || '';

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Elastic Beanstalk Node Lab</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f4f4f4; }
          .card { background: white; padding: 24px; border-radius: 8px; max-width: 700px; }
          h1 { color: #08293C; }
          a { color: #FF5A00; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Node.js Elastic Beanstalk App</h1>
          <p>Status: Deployment successful</p>
          <p>Version: ${APP_VERSION}</p>
          <p><a href="/s3-check">Check S3 integration</a></p>
        </div>
      </body>
    </html>
  `);
});

app.get('/s3-check', async (req, res) => {
  if (!S3_BUCKET_NAME) {
    return res.status(200).send(`
      <html>
        <body style="font-family: Arial, sans-serif; margin: 40px;">
          <h1>S3 Integration Check</h1>
          <p>No S3 bucket configured. Set S3_BUCKET_NAME as an environment variable in Elastic Beanstalk.</p>
          <p><a href="/">Back</a></p>
        </body>
      </html>
    `);
  }

  try {
    const client = new S3Client({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-1' });
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 5
    });

    const result = await client.send(command);
    const objects = result.Contents || [];

    res.status(200).send(`
      <html>
        <body style="font-family: Arial, sans-serif; margin: 40px;">
          <h1>S3 Integration Check</h1>
          <p>Bucket: ${S3_BUCKET_NAME}</p>
          <p>Status: Connected successfully</p>
          <p>Objects found: ${objects.length}</p>
          <ul>
            ${objects.map(obj => `<li>${obj.Key}</li>`).join('')}
          </ul>
          <p><a href="/">Back</a></p>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; margin: 40px;">
          <h1>S3 Integration Check</h1>
          <p>Bucket: ${S3_BUCKET_NAME}</p>
          <p>Status: Failed</p>
          <pre>${error.message}</pre>
          <p><a href="/">Back</a></p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
