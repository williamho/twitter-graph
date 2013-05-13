package twittergraph

import java.lang.String
import org.scala_tools.time.Imports._
import com.gravity.hbase.schema._
import scala.collection._
import org.apache.hadoop.io.Text
import org.apache.hadoop.hbase.HBaseConfiguration
import scala.io._
import scala.xml.XML

import com.twitter.scalding._

import java.io.{BufferedWriter,OutputStreamWriter}
import org.apache.hadoop.fs._
import org.apache.hadoop.conf._
import org.apache.hadoop.io._
import org.apache.hadoop.util._

object TwitterGraph {
  val inputFile = "twittergraph_in.txt"
  val conf = new Configuration()
  val fs = FileSystem.get(conf)
  val localFs = FileSystem.getLocal(conf)
  
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

    "{ \"users\": {\n%s\n}, \n\"links\": [\n%s\n]\n }".format(usersString, linksString)
  }

  def writeOutputFile(localFile: String, contents: String) = {
    val filePath = new Path(localFile)
    val writer = new BufferedWriter(new OutputStreamWriter(localFs.create(filePath)))
    writer.write(contents)
    writer.close
  }

  def deleteHdfsFile(hdfsFile: String) = {
    val hdfsPath = new Path(hdfsFile)
    if (fs exists hdfsPath)
      fs.delete(hdfsPath, true)
  }

  def getMerge(hdfsDir: String, localFile: String) = {
    val hdfsPath = new Path(hdfsDir)
    val localPath = new Path(localFile)
    if (localFs exists localPath)
      localFs.delete(localPath, false)
    FileUtil.copyMerge(fs, hdfsPath, localFs, localPath, true, conf, "");
  }
}

class TwitterGraph(args: Args) extends Job(args) {
  val apiRoute = "https://api.twitter.com/1/users/show.xml"

  val username = args("user").toLowerCase
  val xml = XML.load(apiRoute + "?screen_name=" + username) 
  val userId = (xml \\ "user" \\ "id").text.toLong

  val following = TwitterGraph.writeInputFile(userId)
  val input = TextLine(TwitterGraph.inputFile)
  val output = TextLine(args("output"))

  input.read
  .mapTo('line -> 'userId) { line : String => line.toLong }
  .flatMap('userId -> ('toUserId, 'count)) { userId : Long =>
    TwitterData.getMentions(userId).toList
  }
  .filter('toUserId) { toUserId : Long => following contains toUserId }
  .write(output)

/*
  val localJobOutput = "/tmp/twittergraph-" + username
  TwitterGraph.getMerge(args("output"),localJobOutput)
  TwitterGraph.writeOutputFile(
    "output/" + username + ".json",
    TwitterGraph.jsonFromFile(localJobOutput)
  )
  */
}

