package twittergraph

import com.gravity.hbase.mapreduce._
import java.lang.String
import org.scala_tools.time.Imports._
import com.gravity.hbase.schema._
import scala.collection._
import org.apache.hadoop.io.Text
import org.apache.hadoop.hbase.HBaseConfiguration

import com.twitter.scalding._

import java.io.{BufferedWriter,OutputStreamWriter}
import org.apache.hadoop.fs._
import org.apache.hadoop.conf._
import org.apache.hadoop.io._
import org.apache.hadoop.util._

object TwitterGraph {
  val inputFile = "twittergraph_in.txt"
  
  def writeInputFile(userId: Long): Set[Long] = {
    val following = TwitterData.getFollowing(userId)
    val filePath = new Path(inputFile)

    val fs = FileSystem.get(new Configuration())
    val writer = new BufferedWriter(new OutputStreamWriter(fs.create(filePath)))
    following.foreach { user => writer.write(user.toString + "\n") }
    writer.close
    following
  }
}

class TwitterGraph(args: Args) extends Job(args) {
  val userId = args("id").toLong
  val following = TwitterGraph.writeInputFile(userId)
  val input = TextLine(TwitterGraph.inputFile)
  val output = TextLine("out")
  val names = TwitterData.getNamesFromIds(following)

  input.read
  .mapTo('line -> 'userId) { line : String => line.toLong }
  .flatMap('userId -> ('toUserId, 'count)) { userId : Long =>
    TwitterData.getMentions(userId).toList
  }
  .filter('toUserId) { toUserId : Long => following contains toUserId }
  .mapTo(('userId,'toUserId,'count) -> ('username,'toUsername,'count)) { 
    tuple : (Long, Long, Int) =>
    val (userId, toUserId, count) = tuple
    (names(userId), names(toUserId), count)
  }
  .write(output)
}

