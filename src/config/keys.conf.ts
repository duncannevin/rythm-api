import { Config } from "./config"

export const linkedin: Config = {
  CLIENT_ID: process.env.LINKEDIN_CLIENT_ID || 'please set LINKEDIN_CLIENT_ID in environment',
  CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET || 'please set LINKEDIN_CLIENT_SECRET in environment'
}
export const github: Config = {
  CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'please set GITHUB_CLIENT_ID in environment',
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'please set GITHUB_CLIENT_SECRET in environment'
}
export const twitter: Config = {
  CLIENT_ID: process.env.TWITTER_CLIENT_ID || 'please set TWITTER_CLIENT_ID in environment',
  CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET || 'please set TWITTER_CLIENT_SECRET in environment'
}
export const google: Config = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'please set GITHUB_CLIENT_ID in environment',
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'please set GITHUB_CLIENT_SECRET in environment'
}
