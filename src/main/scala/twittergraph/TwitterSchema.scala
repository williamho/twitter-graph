package twittergraph

import java.lang.String
import org.scala_tools.time.Imports._
import com.gravity.hbase.schema._
import scala.collection._
import org.apache.hadoop.io.Text
import org.apache.hadoop.hbase.HBaseConfiguration

object TwitterSchema extends Schema {
  implicit val conf = HBaseConfiguration.create

  class UsersTable extends HbaseTable[UsersTable, Long, UsersRow](tableName = "twitter_users", rowKeyClass = classOf[Long]) 
  {
    def rowBuilder(result: DeserializedResult) = new UsersRow(this, result)
    
    val info = family[String, String, Any]("info")
    val name = column(info, "name", classOf[String])
    val icon = column(info, "icon", classOf[String])
    val locked = column(info, "lock", classOf[Boolean])
    val followers = column(info, "followers", classOf[Set[Long]])
    val following = column(info, "following", classOf[Set[Long]])

    val mentions = family[String, Long, Int]("mentions") // id -> numMentions

    val meta = family[String, String, Any]("updated")
    val infoUpdated = column(meta, "info", classOf[DateTime])
    val tweetsUpdated = column(meta, "tweets", classOf[DateTime])
    val followersUpdated = column(meta, "followers", classOf[DateTime])
    val followingUpdated = column(meta, "following", classOf[DateTime])
  }

  class UsersRow(table: UsersTable, result: DeserializedResult) extends HRow[UsersTable, Long](result, table)

  val UsersTable = table(new UsersTable)
}

