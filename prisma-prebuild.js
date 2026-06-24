const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  const dbUrl = process.env.DATABASE_URL || '';
  const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
  
  if (isPostgres) {
    console.log('Prisma Prebuild: PostgreSQL detected in environment variables. Rewriting schema.prisma for PostgreSQL...');
    schema = schema.replace(
      /datasource db \{[\s\S]*?\}/,
      `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
    );
    fs.writeFileSync(schemaPath, schema, 'utf8');
  } else {
    console.log('Prisma Prebuild: Using default SQLite provider configuration.');
  }
} else {
  console.log('Prisma Prebuild: prisma/schema.prisma not found.');
}
