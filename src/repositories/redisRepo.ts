import { createClient } from 'redis';

export const redisClient = createClient({
  url: 'redis://127.0.0.1:6379',
});

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.error('Redis error', err);
});


(async () => {
  await redisClient.connect();
})();


const ACCESS_TOKEN_TTL = 60 * 60; 

export const storeAccessToken = async (userId: number, token: string) => {
  await redisClient.set(
    `auth:user:${userId}`,
    token,
    { EX: ACCESS_TOKEN_TTL }
  );
};


export const blacklistToken = async (token: string) => {
  await redisClient.set(
    `blacklist:${token}`,
    'true',
    { EX: ACCESS_TOKEN_TTL }
  );
};

export const isTokenBlacklisted = async (token: string) => {
  return (await redisClient.exists(`blacklist:${token}`)) === 1;
};
