import slidingWindowLimiter from './slidingWindowLimiter.js';
import fixedWindowLimiter from './fixedWindowLimiter.js';

export default function createRateLimiter({ stratergy, maxReq, timeWindow }){
    if(stratergy === 'sliding'){
        return slidingWindowLimiter({ maxReq, timeWindow });
    }
    return fixedWindowLimiter({ maxReq, timeWindow });
}