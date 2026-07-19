import dns from 'dns';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/campuskart';
const DEFAULT_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

export const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      try {
        if (process.env.MONGO_URI.startsWith('mongodb+srv://')) {
          const dnsServers = process.env.MONGO_DNS_SERVERS
            ? process.env.MONGO_DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
            : DEFAULT_DNS_SERVERS;
          dns.setServers(dnsServers);
          console.log(`Using DNS servers for Atlas SRV lookup: ${dnsServers.join(', ')}`);
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (mongoError) {
        console.error(`MongoDB URI connection failed: ${mongoError.message}`);
      }
    }

    try {
      const localUri = process.env.LOCAL_MONGO_URI || DEFAULT_LOCAL_URI;
      const conn = await mongoose.connect(localUri);
      console.log(`MongoDB connected: ${conn.connection.host} (local)`);
      return;
    } catch (localError) {
      console.error(`Local MongoDB connection failed: ${localError.message}`);
      console.error('Falling back to local in-memory MongoDB for development.');
    }

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB memory server started: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
};
