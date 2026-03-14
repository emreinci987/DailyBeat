import app from './app.js';
import environment from './config/environment.js';
import { initFirebase } from './config/firebase.js';
import logger from './utils/logger.js';

// Initialise Firebase
initFirebase();

const PORT = environment.port;

app.listen(PORT, () => {
    logger.info(`DailyBeat API running on http://localhost:${PORT}  [${environment.nodeEnv}]`);
});
