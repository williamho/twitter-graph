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
  
  def writeInputFile(userId: Long) = {
    val following = TwitterData.getFollowing(userId)
    val filePath = new Path(inputFile)

    val fs = FileSystem.get(new Configuration())
    val writer = new BufferedWriter(new OutputStreamWriter(fs.create(filePath)))
    following.foreach { user => writer.write(user.toString + "\n") }
    writer.close
  }
}

class TwitterGraph(args: Args) extends Job(args) {
  val userId = args("id").toLong
  TwitterGraph.writeInputFile(userId);
  val input = TextLine(TwitterGraph.inputFile)
  val output = TextLine("out")

  input.read.write(output)
}

