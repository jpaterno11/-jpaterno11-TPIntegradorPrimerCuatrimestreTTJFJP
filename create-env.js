import fs from 'fs';

const envContent = `DB_HOST=aws-0-sa-east-1.pooler.supabase.com
DB_DATABASE=postgres
DB_USER=postgres.oougkoxzrrusziqleimy
DB_PASSWORD=@Smartrip1803
DB_PORT=6543
JWT_SECRET=your_jwt_secret_key_here
PORT=3000`;

try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please change the JWT_SECRET to a strong secret key');
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
} 