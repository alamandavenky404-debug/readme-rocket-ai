export type Challenge = {
  id: string;
  title: string;
  level: "Easy" | "Medium" | "Hard";
  topic: string;
  prompt: string;
  starter: string;
};

export const CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    title: "Two Sum",
    level: "Easy",
    topic: "Arrays",
    prompt: "Given an array of integers nums and a target, return the indices of the two numbers that add up to target. Assume exactly one solution.",
    starter: "function twoSum(nums, target) {\n  // your code\n}\n",
  },
  {
    id: "valid-parens",
    title: "Valid Parentheses",
    level: "Easy",
    topic: "Stacks",
    prompt: "Given a string containing only ()[]{} characters, determine if the brackets are balanced and correctly nested.",
    starter: "function isValid(s) {\n  // your code\n}\n",
  },
  {
    id: "debounce",
    title: "Implement debounce",
    level: "Medium",
    topic: "JavaScript",
    prompt: "Implement debounce(fn, wait) that delays invoking fn until wait ms have elapsed since the last call. Preserve `this` and arguments.",
    starter: "function debounce(fn, wait) {\n  // your code\n}\n",
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    level: "Medium",
    topic: "Design",
    prompt: "Design an LRUCache class with get(key) and put(key, value) in O(1). When capacity is exceeded, evict the least recently used key.",
    starter: "class LRUCache {\n  constructor(capacity) {}\n  get(key) {}\n  put(key, value) {}\n}\n",
  },
  {
    id: "rate-limiter",
    title: "API Rate Limiter",
    level: "Hard",
    topic: "Scalability",
    prompt: "Implement a sliding-window rate limiter allow(userId) that permits at most N requests per user per 60 seconds. Discuss how you'd scale it across many servers.",
    starter: "class RateLimiter {\n  constructor(limit) {}\n  allow(userId, now = Date.now()) {}\n}\n",
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    level: "Medium",
    topic: "Sorting",
    prompt: "Given an array of intervals [start, end], merge all overlapping intervals and return the result.",
    starter: "function merge(intervals) {\n  // your code\n}\n",
  },
];
