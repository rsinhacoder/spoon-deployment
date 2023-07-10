import "dotenv/config";

const config = {
  userName: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  cluster: process.env.DATABASE_CLUSTER,
  databaseName: process.env.DATABASE_NAME,
  port: process.env.PORT,
  saltValue: 10,
  sendMailId: process.env.SEND_MAIL_ID,
  sendMailPassword: process.env.SEND_MAIL_PASSWORD,
  jwtSecret: process.env.JTW_SECRET,
};

export default config;
