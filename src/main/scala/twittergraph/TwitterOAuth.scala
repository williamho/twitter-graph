package twittergraph

import twitter4j._
import twitter4j.conf.ConfigurationBuilder

trait TwitterInstance {
  val cb = new ConfigurationBuilder()
    .setOAuthConsumerKey("*********************")
    .setOAuthConsumerSecret("*******************************************")
    .setOAuthAccessToken("**************************************************")
    .setOAuthAccessTokenSecret("*******************************************")
  val twitter = new TwitterFactory(cb.build).getInstance
}

