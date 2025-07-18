-- USERS (extend nile_user metadata if needed)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nile_user_id UUID NOT NULL UNIQUE, -- link to Nile's built-in user
  username VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50),
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TWEETS
CREATE TABLE tweets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  parent_tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE, -- for replies
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

-- LIKES
CREATE TABLE likes (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tweet_id)
);

-- RETWEETS
CREATE TABLE retweets (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, tweet_id)
);

-- FOLLOWERS
CREATE TABLE followers (
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followee_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- recipient
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- initiator
  tweet_id UUID REFERENCES tweets(id) ON DELETE SET NULL,
  type VARCHAR(30), -- like, retweet, reply, follow
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEDIA (attachments for tweets)
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type VARCHAR(20), -- image, video
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
