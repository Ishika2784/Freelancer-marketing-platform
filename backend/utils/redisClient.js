const { createClient } = require("redis");

const redis = createClient({
    url: 'redis://localhost:6379'
});

redis.on("error", (err) => console.log("Redis Error:", err));

(async () => {
  try {
    await redis.connect();
  } catch (err) {
    console.error("Failed to connect to Redis server:", err.message);
  }
})();

module.exports = redis;