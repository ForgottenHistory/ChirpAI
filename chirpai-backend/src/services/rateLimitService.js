const settings = require('../config/settings');

class RateLimitService {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
    this.lastRequestTime = 0;
    this.minDelay = settings.rateLimit.minDelay;
    this.retryDelays = settings.rateLimit.retryDelays;
  }

  async queueRequest(requestFunction, retryCount = 0) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        execute: requestFunction,
        resolve,
        reject,
        retryCount,
        addedAt: Date.now()
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        // Ensure minimum delay between requests (reload from config)
        this.minDelay = settings.rateLimit.minDelay;
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
          const waitTime = this.minDelay - timeSinceLastRequest;
          console.log(`[RATE_LIMIT] Waiting ${waitTime}ms before next AI request`);
          await this.sleep(waitTime);
        }

        this.lastRequestTime = Date.now();
        const result = await request.execute();
        request.resolve(result);

      } catch (error) {
        console.error(`[RATE_LIMIT] Request failed:`, {
          status: error.status,
          code: error.code,
          message: error.message,
          type: error.type
        });

        if (error.status === 429 && request.retryCount < this.retryDelays.length) {
          // Rate limited, schedule retry
          const retryDelay = this.retryDelays[request.retryCount];
          console.log(`[RATE_LIMIT] Rate limited, retrying in ${retryDelay}ms (attempt ${request.retryCount + 1})`);
          
          setTimeout(() => {
            this.requestQueue.unshift({
              ...request,
              retryCount: request.retryCount + 1
            });
            this.processQueue();
          }, retryDelay);
        } else if (error.status === 500) {
          // Server error - could be temporary
          if (request.retryCount < 2) {
            console.log(`[RATE_LIMIT] Server error (500), retrying in 5000ms (attempt ${request.retryCount + 1})`);
            setTimeout(() => {
              this.requestQueue.unshift({
                ...request,
                retryCount: request.retryCount + 1
              });
              this.processQueue();
            }, 5000);
          } else {
            console.error(`[RATE_LIMIT] Server error after ${request.retryCount + 1} attempts, giving up`);
            request.reject(new Error(`AI service temporarily unavailable (500 error after retries)`));
          }
        } else {
          // Other errors or max retries reached
          console.error(`[RATE_LIMIT] Request failed permanently:`, error.message);
          request.reject(error);
        }
      }

      // Small delay between successful requests
      await this.sleep(500);
    }

    this.processing = false;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueStatus() {
    return {
      queueLength: this.requestQueue.length,
      processing: this.processing,
      lastRequestTime: this.lastRequestTime,
      minDelay: this.minDelay
    };
  }

  updateMinDelay(newDelay) {
    this.minDelay = newDelay;
    console.log(`[RATE_LIMIT] Updated minimum delay to ${newDelay}ms`);
  }
}

// Create singleton instance
const rateLimitService = new RateLimitService();

module.exports = rateLimitService;