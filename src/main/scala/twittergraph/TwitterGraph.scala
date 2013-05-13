package twittergraph

import com.gravity.hbase.mapreduce._
import java.lang.String
import org.scala_tools.time.Imports._
import com.gravity.hbase.schema._
import scala.collection._
import org.apache.hadoop.io.Text
import org.apache.hadoop.hbase.HBaseConfiguration
import scala.io._

import com.twitter.scalding._

import java.io.{BufferedWriter,OutputStreamWriter}
import org.apache.hadoop.fs._
import org.apache.hadoop.conf._
import org.apache.hadoop.io._
import org.apache.hadoop.util._

object TwitterGraph {
  val inputFile = "twittergraph_in.txt"
  val fs = FileSystem.get(new Configuration())
  
  def writeInputFile(userId: Long): Set[Long] = {
    val following = TwitterData.getFollowing(userId)
    val filePath = new Path(inputFile)

    val writer = new BufferedWriter(new OutputStreamWriter(fs.create(filePath)))
    following.foreach { user => writer.write(user.toString + "\n") }
    writer.close
    following
  }

  def jsonFromFile(filename: String): String = {
    val data = Source.fromFile(filename).getLines.map(_.split("\t").map(_.toLong)).toSeq

    val userIds = data.flatMap(_.init).toSet
    val info = TwitterData.getInfoFromIds(userIds)
    val usersString = info.map(ls =>
      "\"%d\": { \"name\": \"%s\", \"icon\": \"%s\" }".format(ls._1, ls._2._1, ls._2._2)
    ).mkString(",\n")

    val linksString = data.map(ls => 
        "{ \"from\": \"%d\", \"to\": \"%d\", \"weight\": \"%d\"}".format(ls(0), ls(1), ls(2))
    ).mkString(",\n")

    "{ \"users\": {%s}, \"links\": [%s] }".format(usersString, linksString)
  }
}

class TwitterGraph(args: Args) extends Job(args) {
  val userId = args("id").toLong
  val following = TwitterGraph.writeInputFile(userId)
  val input = TextLine(TwitterGraph.inputFile)
  val output = TextLine(args("output"))
  //val info = TwitterData.getInfoFromIds(following)

  input.read
  .mapTo('line -> 'userId) { line : String => line.toLong }
  .flatMap('userId -> ('toUserId, 'count)) { userId : Long =>
    TwitterData.getMentions(userId).toList
  }
  .filter('toUserId) { toUserId : Long => following contains toUserId }
  /*
  .mapTo(('userId,'toUserId,'count) -> ('username,'toUsername,'count)) { 
    tuple : (Long, Long, Int) =>
    val (userId, toUserId, count) = tuple
    (info(userId)._1, info(toUserId)._1, count)
  }
  */
  .write(output)
}

