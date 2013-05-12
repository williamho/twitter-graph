package twittergraph

import java.lang.String
import org.scala_tools.time.Imports._
import scala.collection._
import scala.actors.Futures._
import scala.collection.JavaConverters._
import twitter4j._

// https://github.com/jasonbaldridge/twitter4j-tutorial
trait RateChecker {
  def checkAndWait(response: TwitterResponse) {
    val rateLimitStatus = response.getRateLimitStatus

    if (rateLimitStatus != null && rateLimitStatus.getRemaining == 0) {
      val waitTime = rateLimitStatus.getSecondsUntilReset + 10
      println("Rate limit reached: Waiting " + waitTime/60.0 
        + " minutes for rate limit reset.")
      Thread.sleep(waitTime*1000)
    }
    else
      println("Requests remaining: " + rateLimitStatus.getRemaining) // DEBUG
    response
  }
}

object TwitterData extends TwitterInstance with RateChecker {
  val updateFrequency = 3.days

  def getFollowing(userId: Long): Set[Long] = {
    TwitterSchema.UsersTable.query2.withKey(userId)
      .withColumns(_.followingUpdated, _.following)
      .singleOption() match 
    {
      case Some(pageRow) => {
        val lastUpdated = pageRow.column(_.followingUpdated).getOrElse(new DateTime(0))
        if (DateTime.now > lastUpdated + updateFrequency)
          updateFollowing(userId)
        else
          pageRow.column(_.following).get
      }
      case None => updateFollowing(userId)
    }
  }

  def updateFollowing(userId: Long): Set[Long] = {
    // TODO: Handle exception if user doesn't exist
    var cursor = -1L;
    var mFollowingIds = scala.collection.mutable.Set[Long]()
    do {
      val response = twitter.getFriendsIDs(userId,cursor)
      checkAndWait(response)
      mFollowingIds ++= response.getIDs.toSet
      cursor = response getNextCursor
    }
    while (cursor != 0)

    val followingIds = mFollowingIds.toSet + userId
    TwitterSchema.UsersTable
      .put(userId)
      .value(_.following, followingIds)
      .value(_.followingUpdated, DateTime.now)
      .execute()
    updateUsers(followingIds)
  }

  def getInfoFromIds(userIds: Set[Long]): Map[Long,(String,String)] = {
    userIds.map(id => (id, getInfoFromId(id))).toMap
  }

  def getInfoFromId(userId: Long): (String,String) = {
    TwitterSchema.UsersTable.query2.withKey(userId)
      .withColumns(_.name, _.icon)
      .singleOption() match 
    {
      case Some(pageRow) => {
        val name = pageRow.column(_.name).getOrElse("Unknown")
        val icon = pageRow.column(_.icon).getOrElse("")
        (name,icon)
      }
      case None => { // No info about user. Update their info.
        getFollowing(userId) 
        getInfoFromId(userId)
      }
    }
  }

  def updateUsers(userIds: Set[Long]): Set[Long] = {
    userIds.grouped(100).foreach { userGroup =>
      val response = twitter.lookupUsers(userGroup.toArray)
      checkAndWait(response)
      val users = response.asScala
      users map { user => 
        future {  
          TwitterSchema.UsersTable
            .put(user.getId)
            .value(_.name, user.getScreenName)
            .value(_.icon, user.getMiniProfileImageURL)
            .value(_.locked, user.isProtected)
            .value(_.infoUpdated, DateTime.now)
            .execute()
        } 
      } foreach { _() }
    }
    userIds
  }

  def getMentions(userId: Long): Map[Long,Int] = {
    try {
      TwitterSchema.UsersTable.query2.withKey(userId)
        .withColumns(_.tweetsUpdated)
        .withFamilies(_.mentions)
        .singleOption() match {
        case Some(pageRow) => {
          val lastUpdated = pageRow.column(_.tweetsUpdated).getOrElse(new DateTime(0))
          if (DateTime.now > lastUpdated + updateFrequency)
            updateMentions(userId)
          else
            pageRow.family(_.mentions)
        }
        case None => updateMentions(userId)
      }
    }
    catch {
      case e: Exception => Map[Long,Int]()
    }
  }

  def updateMentions(userId: Long): Map[Long,Int] = {
    val response = twitter.getUserTimeline(userId, new Paging(1,200))
    checkAndWait(response)
    val tweets = response.asScala

    // Count number of occurrences http://stackoverflow.com/a/12166330/1887090
    val mentionEntities = tweets.map(_.getUserMentionEntities) // e.g., ((user1,user2,user3), null, (user3,user2,user2))
    val flattenedEntities = mentionEntities.filter(_ != null).flatten.map(_.getId) // e.g., (1,2,3,3,2,2)
    val mentionsCount = flattenedEntities.groupBy(identity).map(x => (x._1,x._2.size)) // e.g., (1->1, 2->3, 3->2)

    TwitterSchema.UsersTable
      .put(userId)
      .value(_.tweetsUpdated, DateTime.now)
      .valueMap(_.mentions, mentionsCount)
      .execute() 

    mentionsCount
  }
}

