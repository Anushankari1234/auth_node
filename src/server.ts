import app from './app';
import { AppDataSource } from './data-source';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source initialized');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('Error during Data Source initialization', err));
