import app from "./app";
import envConfig from "./config/env.config";
import dotenv from 'dotenv';

dotenv.config();

app.listen(envConfig.PORT, () => {
  console.log(`APP RUNNING AT PORT ${envConfig.PORT}`);
});
